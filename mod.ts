/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

export * from "./types.d.ts";
export * from "./util.ts";
export { Buffer } from "./deps.ts";

import { Sink, Source } from "./types.d.ts";
import { bytes } from "./util.ts";

/** Represents the byte-order used to encode numbers. */
export type Endian = "be" | "le";

/** The byte-order used by the system to encode numbers,
 * either `"be"` or `"le"`.
 * Currently does not detect mixed-endian *(unsure if this
 * is a concern for JavaScript applications)*. */
export const SYSTEM_ENDIAN: Endian = (() => {
  const a = new Uint16Array([0x1234]);
  return (bytes(a)[0] == 0x12) ? "be" : "le";
})();

export class DecodeError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = this.constructor.name;
  }
}

export class ZeroCopyBuf implements Readonly<ArrayBufferView> {
  #buf: ArrayBuffer;

  /** Create a new container for zero-copy byob stream operations.
   *
   * ```ts
   * const zcbuf = new ZeroCopyBuf(42);
   * const window = await zcbuf.moveExactFrom(source);
   * console.log(window);
   * ```
   */
  constructor(size: number) {
    this.#buf = new ArrayBuffer(size);
  }

  get buffer(): ArrayBufferLike {
    return this.#buf;
  }
  get byteLength(): number {
    return this.#buf.byteLength;
  }
  get byteOffset(): number {
    return 0;
  }

  /** Read bytes from a BYOB stream, until specified window of `ZeroCopyBuf`
   *   filled or the end of the stream is reached.
   * Returns `Uint8Array` view on section of `ZeroCopyBuf` filled by read.
   *
   * **Note: returned `Uint8Array` may be shorter than `limit`.**
   *
   * ```ts
   * const v = await buf.fillFrom(r);
   * if (v.byteLength != buf.byteLength) {
   *   console.log("End of stream reached");
   * }
   * ```
   *
   * See how it was implemented:
   * + [web.dev Streams API Guide](https://web.dev/streams/#readable-byte-stream-code-sample)
   * + [Deno GitHub Issue on Detached Buffers](https://github.com/denoland/deno/issues/14382)
   * + [MDN Docs on Using Readable Byte Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_byte_streams#consuming_the_byte_stream)
   */
  async fillFrom(
    source: Source<Uint8Array>,
    offset = 0,
    limit = this.byteLength,
  ): Promise<Uint8Array> {
    let nread = 0;
    // Setup a BYOB reader, which enables buffer oriented (and zero-copy) reads.
    const r = source.readable.getReader({ mode: "byob" });
    while (nread < limit) {
      const { value, done } = await r.read(
        // Create a new ArrayBufferView (of which Uint8Array is one).
        // This gives a window / slot to be read into so we can read exactly what we want.
        new Uint8Array(this.#buf, offset + nread, limit - nread),
      );
      if (value !== undefined) {
        // We've successfully got some data from our source; however, because
        //   we passed in our this.#buf to a BYOB reader (via Uint8Array
        //   constructor above) the ArrayBuffer has become detached.
        // Typically if you access a detached buffer it's obvious because it has
        //   has zero elements, but a bug in Deno means it appears as a zero-
        //   filled buffer (making one think nothing, or only zeros, were read).
        // See https://github.com/denoland/deno/issues/14382#issue-1213634663
        // We can claw back a detached array buffer via 'value',
        //   which is a Uint8Array view of the bytes successfully read.
        this.#buf = value.buffer;
        // The byte length of the view is how much was read.
        nread += value.byteLength;
      } else {
        // stream cancelled
        break;
      }
      // end of stream
      if (done) break;
    }
    // If we didn't free the reader, no one would be able to read from the source again.
    r.releaseLock();
    return new Uint8Array(this.#buf, offset, nread);
  }

  /** Perform a zero-copy byob read from `source`, filling up exactly the
   * specified window. In the case that not enough bytes could be read,
   * throw an error. Returns a `Uint8Array` window into the internal buffer.
   *
   * ```ts
   * const zcbuf = new ZeroCopyBuf(42);
   * const window = await zcbuf.fillExactFrom(source);
   * console.log(window);
   * ```
   */
  async fillExactFrom(
    source: Source<Uint8Array>,
    offset = 0,
    count = this.byteLength,
  ): Promise<Uint8Array> {
    const window = await this.fillFrom(source, offset, count);
    if (window.byteLength != count) throw new DecodeError("Unexpected EOF");
    return window;
  }
}

/** Read exactly `n` bytes into a new `Uint8Array` buffer and return it.
 * `source` should implement BYOB.
 *
 * ```ts
 * const out: Uint8Array = await readN(readableByteStreamSource, 12);
 * out.byteLength == 12; // true
 * ```
 */
export async function readN(
  source: Source<Uint8Array>,
  n: number,
): Promise<Uint8Array> {
  return await new ZeroCopyBuf(n).fillExactFrom(source);
}

/** Write a chunk into a Stream Sink.

 * ```ts
 * const buf = new Buffer();
 * const txt = new TextEncoder().encode("Hello, World!");
 * await write(buf, txt);
 * ```
 */
export async function write<T>(sink: Sink<T>, chunk: T): Promise<void> {
  const w = sink.writable.getWriter();
  await w.write(chunk);
  w.releaseLock();
}

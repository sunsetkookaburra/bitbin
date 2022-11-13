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

  /** Read bytes until `ZeroCopyBuf` filled, or end of file.
   * `source` should implement BYOB.
   * Returns `Uint8Array` view on section of `ZeroCopyBuf` filled by read.
   * (will be shorter than `ZeroCopyBuf.byteLength`
   * or `n` if EOF reached or stream cancelled).
   *
   * ```ts
   * const v = await buf.moveFrom(r);
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
  async moveFrom(
    source: Source<Uint8Array>,
    moveOffset = 0,
    moveCount = this.byteLength,
  ): Promise<Uint8Array> {
    let pos = 0;
    // Setup a BYOB reader, which enables buffer oriented (and zero-copy) reads.
    const r = source.readable.getReader({ mode: "byob" });
    const limit = Math.min(moveCount ?? this.byteLength, this.byteLength) -
      moveOffset;
    while (pos < limit) {
      const { value, done } = await r.read(
        // Create a new ArrayBufferView (of which Uint8Array is one).
        // This gives a window / slot to be read into so we can read exactly what we want.
        new Uint8Array(this.#buf, moveOffset + pos, this.#buf.byteLength - pos),
      );
      if (value !== undefined) {
        // We've successfully got some data from our source
        // Because we passed in our buffer to a BYOB reader (via the Uint8Array constructor above)
        // The ArrayBuffer has been detached. This would normally be caught but a bug in Deno means
        // it just gets treated as a zero-filled buffer (making one think nothing actually was read).
        // See https://github.com/denoland/deno/issues/14382#issue-1213634663
        // Our detached array buffer can be returned back via 'value',
        // which is a Uint8Array view of the bytes successfully read.
        this.#buf = value.buffer as SharedArrayBuffer;
        // The byte length of the view is how much was read.
        pos += value.byteLength;
      } else {
        r.releaseLock();
        throw new DecodeError("Unexpected stream cancellation");
      }
      if (done) {
        // We've already reached EOF, thus unable to fill target.
        // Release lock in case it can be rescued (I'm unsure on this).
        r.releaseLock();
        // Currently throw a decode error, but may be an EOF in future.
        throw new DecodeError("Unexpected end of source");
      }
    }
    // If we didn't free the reader, no one would be able to read from the source again.
    r.releaseLock();
    // pos ends up as the total number of bytes read.
    return bytes(this);
  }

  /** Perform a zero-copy byob read from `source`, filling up exactly the
   * specified window. In the case that not enough bytes could be read,
   * throw an error. Returns a `Uint8Array` window into the internal buffer.
   *
   * ```ts
   * const zcbuf = new ZeroCopyBuf(42);
   * const window = await zcbuf.moveExactFrom(source);
   * console.log(window);
   * ```
  */
  async moveExactFrom(
    source: Source<Uint8Array>,
    moveOffset?: number,
    moveCount?: number,
  ): Promise<Uint8Array> {
    const window = await this.moveFrom(source, moveOffset, moveCount);
    if (window.byteLength != this.byteLength) {
      throw new DecodeError("Unexpected EOF");
    }
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
  return await new ZeroCopyBuf(n).moveExactFrom(source);
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

export * from "./types.d.ts";
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

/** Read bytes to fill `buffer` exactly, with no extra bytes consumed.
 * `source` should implement BYOB.
 * Returns the buffer used, to replace the input which beomes detached.
 *
 * See how it was implemented:
 * + [web.dev Streams API Guide](https://web.dev/streams/#readable-byte-stream-code-sample)
 * + [Deno GitHub Issue on Detached Buffers](https://github.com/denoland/deno/issues/14382)
 * + [MDN Docs on Using Readable Byte Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_byte_streams#consuming_the_byte_stream)
 *
 * ```ts
 * let buf = new ArrayBuffer(42);
 * buf = await readFull(readableByteStreamSource, buf);
 * console.log(new Uint8Array(buf));
 * ```
 */
export async function readFull(
  source: Source<Uint8Array>,
  buffer: ArrayBuffer,
) {
  let pos = 0;
  // Setup a BYOB reader, which enables buffer oriented (and zero-copy) reads.
  const r = source.readable.getReader({ mode: "byob" });
  while (pos < buffer.byteLength) {
    const { value, done } = await r.read(
      // Create a new ArrayBufferView (of which Uint8Array is one).
      // This gives a window / slot to be read into so we can read exactly what we want.
      new Uint8Array(buffer, pos, buffer.byteLength - pos),
    );
    if (done) {
      // We've already reached EOF, thus unable to fill target.
      // Release lock in case it can be rescued (I'm unsure on this).
      r.releaseLock();
      // Currently throw a decode error, but may be an EOF in future.
      throw new DecodeError("Unexpected end of source");
    } else {
      // We've successfully got some data from our source
      // Because we passed in our buffer to a BYOB reader (via the Uint8Array constructor above)
      // The ArrayBuffer has been detached. This would normally be caught but a bug in Deno means
      // it just gets treated as a zero-filled buffer (making one think nothing actually was read).
      // See https://github.com/denoland/deno/issues/14382#issue-1213634663
      // Our detached array buffer can be returned back via value, which is a Uint8Array view of the bytes successfully read.
      buffer = value.buffer;
      // The byte length of the view is how much was read.
      pos += value.byteLength;
    }
  }
  // If we didn't free the reader, no one would be able to read from the source again.
  r.releaseLock();
  // pos ends up as the total number of bytes read.
  return buffer;
}

/** Read exactly `n` bytes into a new `Uint8Array` buffer and return it.
 * `source` should implement BYOB.
 *
 * ```ts
 * const out: Uint8Array = await readNBytes(readableByteStreamSource, 12);
 * out.byteLength == 12; // true
 * ```
 */
export async function readNBytes(source: Source<Uint8Array>, n: number) {
  return bytes(await readFull(source, new ArrayBuffer(n)));
}

/** Write a chunk into a Stream Sink.

 * ```ts
 * const buf = new Buffer();
 * const txt = new TextEncoder().encode("Hello, World!");
 * await write(buf, txt);
 * ```
 */
export async function write<T>(sink: Sink<T>, chunk: T) {
  const w = sink.writable.getWriter();
  await w.write(chunk);
  w.releaseLock();
}

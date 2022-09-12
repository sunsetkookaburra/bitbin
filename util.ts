/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { ByteSink, ByteSource, DecodeError } from "./mod.ts";

/** Shorthand to create a `DataView` of `source`,
 * respecting `byteOffset` and `byteLength` for ArrayBufferViews.
 *
 * ```ts
 * const data = new Uint8Array([0x09, 0x00]);
 * const value = view(data).getUint16(0, true);
 * value == 9; // true
 * ```
 */
export function view(source: BufferSource): DataView {
  return (
    "buffer" in source
      ? new DataView(source.buffer, source.byteOffset, source.byteLength)
      : new DataView(source)
  );
}

/** Get a `Uint8Array` *reference* of the underlying bytes in `source`.
 *
 * ```ts
 * const data = new Uint16Array([5, 4]);
 * const ref = bytes(data);
 * // assuming little-endian
 * console.log(ref); // Uint8Array(4) [ 5, 0, 4, 0 ]
 * ```
 */
export function bytes(source: BufferSource): Uint8Array {
  return (
    "buffer" in source
      ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
      : new Uint8Array(source)
  );
}

/** Concatenate `arrays` into a new `Uint8Array`
 *
 * ```ts
 * const one = new Uint8Array([0xDE, 0xAD]);
 * const two = new Uint16Array([0xEFBE]);
 * const out = cat(one, two);
 * // assuming little-endian
 * console.log(out); // Uint8Array(4) [ 222, 173, 190, 239 ]
 * ```
 */
export function cat(arrays: BufferSource[]): Uint8Array {
  // get total length
  let len = 0;
  for (const arr of arrays) {
    len += arr.byteLength;
  }
  let offset = 0;
  // new storage space buffer
  const buf = new Uint8Array(len);
  // fill new buffer by copying
  for (const arr of arrays) {
    buf.set(bytes(arr), offset);
    offset += arr.byteLength;
  }
  return buf;
}

/** Read bytes to fill `buffer` exactly, with no extra bytes consumed.
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
  source: ByteSource,
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

/** Write all of `source` into `sink`.

 * ```ts
 * const txt = new TextEncoder().encode("Hello, World!");
 * await writeFull(writableStreamSink, txt);
 * ```
 */
export async function writeFull(sink: ByteSink, source: Uint8Array) {
  const w = sink.writable.getWriter();
  await w.write(source);
  w.releaseLock();
}

/** Read exactly `n` bytes into a new `Uint8Array` buffer and return it.
 *
 * ```ts
 * const out: Uint8Array = await readN(readableByteStreamSource, 12);
 * out.byteLength == 12; // true
 * ```
 */
export async function readN(source: ByteSource, n: number) {
  return bytes(await readFull(source, new ArrayBuffer(n)));
}

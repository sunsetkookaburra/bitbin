/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { DecodeError } from "./mod.ts";

/** Shorthand to create a `DataView` of `source`. */
export function view(source: BufferSource): DataView {
  return (
    "buffer" in source
      ? new DataView(source.buffer, source.byteOffset, source.byteLength)
      : new DataView(source)
  );
}

/** Get a `Uint8Array` *reference* of the underlying bytes in `source`. */
export function bytes(source: BufferSource): Uint8Array {
  return (
    "buffer" in source
      ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
      : new Uint8Array(source)
  );
}

/** Concatenate `arrays` into a new `Uint8Array` */
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

export async function readN(source: { readable: ReadableStream<Uint8Array> }, n: number) {
  const r = source.readable.getReader({ mode: "byob" });
  let buffer = new ArrayBuffer(n);
  let offset = 0;
  while (offset < buffer.byteLength) {
    const { value, done } = await r.read(new Uint8Array(buffer, offset, buffer.byteLength - offset));
    if (done) {
      r.releaseLock();
      throw new DecodeError("Unexpected end of source data");
    } else {
      buffer = value.buffer as Uint8Array;
      offset += value.byteLength;
    }
  }
  r.releaseLock();
  return bytes(buffer);
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

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
 * const ref = asBytes(data);
 * // assuming little-endian
 * console.log(ref); // Uint8Array(4) [ 5, 0, 4, 0 ]
 * ```
 */
export function asBytes(source: BufferSource): Uint8Array {
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
    buf.set(asBytes(arr), offset);
    offset += arr.byteLength;
  }
  return buf;
}

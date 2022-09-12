/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

export * from "./types.d.ts";
export * from "./util.ts";

import { Buffer } from "./deps.ts";
import type { ByteSource, Codec } from "./types.d.ts";
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

export function decode<T>(
  encoder: Codec<T>,
  source: ByteSource,
): Promise<T> {
  return encoder.readFrom(source);
}

export function encode<T>(encoder: Codec<T>, value: T): Uint8Array {
  const buf = new Buffer();
  encoder.writeTo(buf, value);
  return buf.bytes({ copy: false });
}

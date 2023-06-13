/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, write, Buffer, ZeroCopier, DecodeError } from "../mod.ts";
import { Uint8 } from "./mod.ts";

export const Uvarint: Codec<bigint> = {
  label: "Uvarint",
  writeTo: async (sink, value) => {
    if (value < 0) throw RangeError("Value must be >= 0");
    while (value >= 0x80) {
      await Uint8.writeTo(sink, Number(value | 0x80n));
      value >>= 7n;
    }
    await Uint8.writeTo(sink, Number(value));
  },
  readFrom: async (source) => {
    let buf = new Uint8Array(1);
    const zc = new ZeroCopier(source);
    let num = 0n;
    let i = 0n;
    do {
      buf = await zc.readInto(buf);
      if (buf.length < 1) throw new DecodeError("Unexpected EOF");
      num |= BigInt(0x7F & buf[0]) << (7n * i++);
    } while (buf[0] & 0x80)
    zc.close();
    return num;
  },
};

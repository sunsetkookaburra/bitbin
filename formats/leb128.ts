/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, write, Buffer } from "../mod.ts";
import { Uint8 } from "./mod.ts";

export const BigUleb128: Codec<bigint> = {
  label: "BigUvarint",
  writeTo: async (sink, value) => {
    if (value < 0) throw RangeError("Value must be >= 0");
    while (value >= 0x80) {
      await Uint8.writeTo(sink, Number(value | 0x80n));
       value >>= 7n;
    }
    await Uint8.writeTo(sink, Number(value));
  },
  readFrom: (_source) => {
    throw Error("Not implemented");
  },
};

const buf = new Buffer();
await BigUleb128.writeTo(buf, 0xFFn);
console.log(buf.bytes({ copy: false }));

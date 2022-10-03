/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Buffer, Codec, write } from "../mod.ts";
import { BytesRef } from "./mod.ts";

/** Encodes and decodes UTF-8 text as null terminated strings,
 * but it must not contain `'\0'`. */
export const CString: Codec<string> = {
  label: "CString",
  writeTo: async (sink, value) => {
    if (value.includes("\0")) {
      throw new Error("Input 'value' cannot contain nul");
    }
    const data = new TextEncoder().encode(value + "\0");
    await write(sink, data);
  },
  readFrom: async (source) => {
    const buf = new Buffer();
    const cdc = BytesRef(1, "CString::readFrom");
    let ch = await cdc.readFrom(source);
    await write(buf, ch);
    while (ch[0] != 0) {
      ch = await cdc.readFrom(source);
      await write(buf, ch);
    }
    return new TextDecoder().decode(buf.bytes()).slice(0, -1);
  },
};

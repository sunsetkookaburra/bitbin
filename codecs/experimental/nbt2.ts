/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, write } from "../../mod.ts";
import { BytesRef, Uint16, Uint8, Void } from "../mod.ts";

const NbtString: Codec<string> = {
  label: "NbtString",
  writeTo: async (sink, value) => {
    const txt = new TextEncoder().encode(value);
    await Uint16.be.writeTo(sink, txt.byteLength);
    await write(sink, txt);
  },
  readFrom: async (source) => {
    const size = await Uint16.be.readFrom(source);
    const txt = await BytesRef(size).readFrom(source);
    return new TextDecoder().decode(txt);
  },
};

// const TagEnd = Void;
// const TagByte = Uint8;
// const

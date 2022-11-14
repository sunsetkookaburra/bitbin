/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, write, ZeroCopyBuf } from "../mod.ts";

export function Utf8(size: number, label = ""): Codec<string> {
  const labelStr = `Utf8[${size}](${label})`;
  const zcbuf = new ZeroCopyBuf(size);
  return {
    "label": labelStr,
    writeTo: async (sink, value) => {
      if (value.length != size) {
        throw new RangeError(
          `Utf8 value length '${value.length}' != ${labelStr} length '${size}'`,
        );
      } else {
        await write(sink, new TextEncoder().encode(value));
      }
    },
    readFrom: async (source) => {
      return new TextDecoder().decode(await zcbuf.fillExactFrom(source));
    },
  };
}

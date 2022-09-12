/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, readFull, writeFull } from "../mod.ts";

export function Utf8(size: number, label = ""): Codec<string> {
  const labelStr = `Utf8[${size}](${label})`;
  let buf = new ArrayBuffer(size);
  return {
    "label": labelStr,
    writeTo: async (sink, value) => {
      if (value.length != size) {
        throw new RangeError(
          `Utf8 value length '${value.length}' != ${labelStr} length '${size}'`,
        );
      } else {
        await writeFull(sink, new TextEncoder().encode(value));
      }
    },
    readFrom: async (source) => {
      buf = await readFull(source, buf);
      return new TextDecoder().decode(buf);
    },
  };
}

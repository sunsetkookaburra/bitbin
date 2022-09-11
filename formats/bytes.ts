/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec } from "../mod.ts";
import { readN } from "../util.ts";

export function Bytes(size: number, label = ""): Codec<Uint8Array> {
  const labelStr = `Bytes[${size}](${label})`;
  return {
    "label": labelStr,
    writeTo: async ({ writable }, value) => {
      if (value.length != size) {
        throw new RangeError(
          `Bytes value length '${value.length}' != ${labelStr} length '${size}'`,
        );
      } else {
        const w = writable.getWriter();
        await w.write(value);
        w.releaseLock();
      }
    },
    readFrom: async (source) => {
      const buf = await readN(source, size);
      return buf;
    },
  };
}

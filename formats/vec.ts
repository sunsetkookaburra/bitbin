/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import type { Codec } from "../types.d.ts";

/** Codec for fixed size arrays/vectors. */
export function Vec<T>(
  codec: Codec<T>,
  length: number,
  label = "",
): Codec<T[]> {
  const labelStr = `Vec[${length}](${label})`;
  return {
    label: labelStr,
    writeTo: async (sink, value) => {
      if (value.length != length) {
        throw RangeError(
          `Vec value length '${value.length}' != ${labelStr} length '${length}'`,
        );
      } else {
        for (let i = 0; i < length; ++i) {
          await codec.writeTo(sink, value[i]);
        }
      }
    },
    readFrom: async (source) => {
      const out = [] as T[];
      for (let i = 0; i < length; ++i) {
        out.push(await codec.readFrom(source));
      }
      return out;
    },
  };
}

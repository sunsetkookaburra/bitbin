/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import type { Codec } from "../mod.ts";

export function Tuple<T extends { [K in keyof T]: T[K] } & unknown[]>(
  tuple: { [K in keyof T]: Codec<T[K]> } & unknown[],
  label = "",
): Codec<T> {
  const labelStr = `Tuple(${label})`;
  const length = tuple.length;
  return {
    label: labelStr,
    writeTo: async (sink, value) => {
      if (value.length != length) {
        throw RangeError(
          `Tuple value length '${value.length}' != ${labelStr} length '${length}'`,
        );
      } else {
        for (let i = 0; i < length; ++i) {
          await tuple[i].writeTo(sink, value[i] as T[number]);
        }
      }
    },
    readFrom: async (source) => {
      const out = [] as unknown[] as T;
      for (let i = 0; i < length; ++i) {
        out.push(await tuple[i].readFrom(source));
      }
      return out;
    },
  };
}

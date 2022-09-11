/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import type { Codec } from "../types.d.ts";

/** Encodes and decodes packed structs. (Aligned structures can be done with own e.g. `_pad1` encoder keys). */
export function Struct<T extends { [K in keyof T]: unknown }>(
  structure: { [K in keyof T]: Codec<T[K]> },
  label = "",
): Codec<T> {
  return {
    label: `Struct(${label})`,
    writeTo: async (sink, value) => {
      for (const k in structure) {
        await structure[k].writeTo(sink, value[k]);
      }
    },
    readFrom: async (source) => {
      const out = {} as T;
      for (const k in structure) {
        out[k] = await structure[k].readFrom(source);
      }
      return out;
    },
  };
}

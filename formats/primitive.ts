/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import type { Codec } from "../types.d.ts";
import { readN, view } from "../util.ts";
import { SYSTEM_ENDIAN } from "../mod.ts";

interface Primitives {
  "Uint8": number;
  "Uint16": number;
  "Uint32": number;
  "BigUint64": bigint;
  "Int8": number;
  "Int16": number;
  "Int32": number;
  "BigInt64": bigint;
  "Float32": number;
  "Float64": number;
}

function buildCodec<T extends keyof Primitives>(
  type: T,
  littleEndian: boolean = SYSTEM_ENDIAN == "le",
): Codec<Primitives[T]> {
  const size = parseInt(type.match(/\d+/)![0]) / 8;
  const getter: `get${T}` = `get${type}`;
  const setter: `set${T}` = `set${type}`;
  if (type === "Int8" || type === "Uint8") littleEndian = false;
  return {
    label: type,
    writeTo: async ({ writable }, value) => {
      const buf = new Uint8Array(size);
      view(buf)[setter](0, value as never, littleEndian);
      const w = writable.getWriter();
      await w.write(buf);
      w.releaseLock();
    },
    readFrom: async (source) => {
      const buf = await readN(source, size);
      return view(buf)[getter](0, littleEndian) as Primitives[T];
    },
  };
}

export const Uint8 = buildCodec("Uint8");
export const Uint16 = {
  ne: buildCodec("Uint16"),
  be: buildCodec("Uint16", false),
  le: buildCodec("Uint16", true),
};
export const Uint32 = {
  ne: buildCodec("Uint32"),
  be: buildCodec("Uint32", false),
  le: buildCodec("Uint32", true),
};
export const BigUint64 = {
  ne: buildCodec("BigUint64"),
  be: buildCodec("BigUint64", false),
  le: buildCodec("BigUint64", true),
};

export const Int8 = buildCodec("Int8");
export const Int16 = {
  ne: buildCodec("Int16"),
  be: buildCodec("Int16", false),
  le: buildCodec("Int16", true),
};
export const Int32 = {
  ne: buildCodec("Int32"),
  be: buildCodec("Int32", false),
  le: buildCodec("Int32", true),
};
export const BigInt64 = {
  ne: buildCodec("BigInt64"),
  be: buildCodec("BigInt64", false),
  le: buildCodec("BigInt64", true),
};

export const Float32 = {
  ne: buildCodec("Float32"),
  be: buildCodec("Float32", false),
  le: buildCodec("Float32", true),
};
export const Float64 = {
  ne: buildCodec("Float64"),
  be: buildCodec("Float64", false),
  le: buildCodec("Float64", true),
};

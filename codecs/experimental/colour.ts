/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

// import { Buffer } from "../../deps.ts";
import { Codec, readN, write } from "../../mod.ts";
import { Float32, Struct, Uint32, Uint8 } from "./../mod.ts";

export const Rgb24 = Struct({
  r: Uint8,
  g: Uint8,
  b: Uint8,
});

export const Rgb24int: Codec<number> = {
  label: "Rgb24int",
  writeTo: async (sink, value) => {
    await write(sink, new Uint8Array([value >> 16, value >> 8, value]));
  },
  readFrom: async (source) => {
    const buf = await readN(source, 3);
    return (buf[0] << 16) | (buf[1] << 8) | buf[2];
  },
};

export const Bgr24 = Struct({
  b: Uint8,
  g: Uint8,
  r: Uint8,
});

export const Rgba32 = Struct({
  r: Uint8,
  g: Uint8,
  b: Uint8,
  a: Uint8,
});

export const Rgba32int: Codec<number> = {
  label: "Rgba32int",
  writeTo: Uint32.be.writeTo,
  readFrom: Uint32.be.readFrom,
};

export const RgbaF32be = Struct({
  r: Float32.be,
  g: Float32.be,
  b: Float32.be,
  a: Float32.be,
});

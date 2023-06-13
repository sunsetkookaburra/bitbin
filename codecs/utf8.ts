/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, DecodeError, readFull, write } from "../mod.ts";
import { Uint8 } from "./mod.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const Utf8Codepoint: Codec<number> = {
  label: "Utf8Codepoint",
  writeTo: async (sink, value) => {
    if (value < 0x0000) {
      throw new RangeError("Value must be in range U+0000 to U+10FFFF");
    } else if (value < 0x0080) {
      await write(sink, new Uint8Array([
        value,
      ]));
    } else if (value < 0x0800) {
      await write(sink, new Uint8Array([
        0b110 | ((value >> 6) & 0x1F),
        0b10 | (value & 0x3F),
      ]));
    } else if (value < 0x10000) {
      await write(sink, new Uint8Array([
        0b1110 | ((value >> 12) & 0x0F),
        0b10 | ((value >> 6) & 0x3F),
        0b10 | (value & 0x3F),
      ]));
    } else if (value < 0x110000) {
      await write(sink, new Uint8Array([
        0b11110 | ((value >> 18) & 0x07),
        0b10 | ((value >> 12) & 0x3F),
        0b10 | ((value >> 6) & 0x3F),
        0b10 | (value & 0x3F),
      ]));
    } else {
      throw new RangeError("Value must be in range U+0000 to U+10FFFF");
    }
  },
  readFrom: async (source) => {
    let codepoint = 0;
    const head = await Uint8.readFrom(source);
    if (head < 0x80) {
      codepoint = head;
    } else if (head < 0xE0) {
      codepoint = head & 0x1F;
      const b1 = await Uint8.readFrom(source);
      if (b1 >= 0xC0) throw new DecodeError("Invalid Utf8 byte");
      codepoint = (codepoint << 6) | b1 & 0x3F;
    } else if (head < 0xF0) {
      codepoint = head & 0x0F;
      const b1 = await Uint8.readFrom(source);
      const b2 = await Uint8.readFrom(source);
      if (b1 >= 0xC0 || b2 >= 0xC0) throw new DecodeError("Invalid Utf8 byte");
      codepoint = (codepoint << 6) | b1 & 0x3F;
      codepoint = (codepoint << 6) | b2 & 0x3F;
    } else if (head < 0xF8) {
      codepoint = head & 0x07;
      const b1 = await Uint8.readFrom(source);
      const b2 = await Uint8.readFrom(source);
      const b3 = await Uint8.readFrom(source);
      if (b1 >= 0xC0 || b2 >= 0xC0 || b3 >= 0xC0) throw new DecodeError("Invalid Utf8 byte");
      codepoint = (codepoint << 6) | b1 & 0x3F;
      codepoint = (codepoint << 6) | b2 & 0x3F;
      codepoint = (codepoint << 6) | b3 & 0x3F;
    } else {
      throw new DecodeError("Invalid Utf8 byte");
    }
    if (codepoint < 0 || codepoint > 0x10FFFF) {
      throw new DecodeError("Codepoint outside of Unicode range");
    }
    return codepoint;
  },
};

export const Utf8: Codec<string> = {
  label: "Utf8",
  writeTo: async (sink, value) => {
    await write(sink, encoder.encode(value));
  },
  readFrom: async (source) => {},
};

export function Utf8Fixed(size: number, label = ""): Codec<string> {
  const labelStr = `Utf8Fixed[${size}](${label})`;
  let buf = new ArrayBuffer(size);
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
      buf = await readFull(source, buf);
      return new TextDecoder().decode(buf);
    },
  };
}

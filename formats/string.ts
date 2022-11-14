/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Buffer, ZeroCopyBuf, Codec, write } from "../mod.ts";
import { BytesRef } from "./mod.ts";

const txtEnc = new TextEncoder();
const txtDec = new TextDecoder();

/** Encode and decode a length-prefixed UTF-8 string.
 *
 * **Set `maxLength` to avoid string length overflows on encode.** */
export function PrefixString(prefix: Codec<number>, maxLength?: number): Codec<string> {
  return {
    writeTo: async (sink, value) => {
      const txt = txtEnc.encode(value);
      if (maxLength !== undefined && txt.byteLength > maxLength) {
        throw new RangeError("Encoded string would be too long");
      }
      await prefix.writeTo(sink, txt.byteLength);
      await write(sink, txt);
    },
    readFrom: async (source) => {
      const size = await prefix.readFrom(source);
      const txt = await Utf8(size).readFrom(source);
      return txt;
    }
  };
}

/** Encodes and decodes UTF-8 text as null terminated strings,
 * but it must not contain `'\0'`. */
export const CString: Codec<string> = {
  label: "CString",
  writeTo: async (sink, value) => {
    if (value.includes("\0")) {
      throw new Error("Input 'value' cannot contain nul");
    }
    const data = new TextEncoder().encode(value + "\0");
    await write(sink, data);
  },
  readFrom: async (source) => {
    const buf = new Buffer();
    const cdc = BytesRef(1, "CString::readFrom");
    let ch = await cdc.readFrom(source);
    await write(buf, ch);
    while (ch[0] != 0) {
      ch = await cdc.readFrom(source);
      await write(buf, ch);
    }
    return new TextDecoder().decode(buf.bytes()).slice(0, -1);
  },
};

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
        await write(sink, txtEnc.encode(value));
      }
    },
    readFrom: async (source) => {
      return txtDec.decode(await zcbuf.fillExactFrom(source));
    },
  };
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { bytes, Codec, readFull, write } from "../mod.ts";

/** Read and write fixed size byte arrays, but return a reference only valid until the next call per constructed codec. */
export function BytesRef(size: number, label = ""): Codec<Uint8Array> {
  const labelStr = `Bytes[${size}](${label})`;
  let buf = new ArrayBuffer(size);
  return {
    "label": labelStr,
    writeTo: async (sink, value) => {
      if (value.length != size) {
        throw new RangeError(
          `Bytes value length '${value.length}' != ${labelStr} length '${size}'`,
        );
      } else {
        await write(sink, value);
      }
    },
    readFrom: async (source) => {
      buf = await readFull(source, buf);
      return bytes(buf);
    },
  };
}

export function Bytes(size: number, label = ""): Codec<Uint8Array> {
  const labelStr = `Bytes[${size}](${label})`;
  let buf = new ArrayBuffer(size);
  return {
    "label": labelStr,
    writeTo: async (sink, value) => {
      if (value.length != size) {
        throw new RangeError(
          `Bytes value length '${value.length}' != ${labelStr} length '${size}'`,
        );
      } else {
        await write(sink, value);
      }
    },
    readFrom: async (source) => {
      buf = await readFull(source, buf);
      return bytes(buf.slice(0));
    },
  };
}

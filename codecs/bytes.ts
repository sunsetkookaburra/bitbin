/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, write, ZeroCopyBuf } from "../mod.ts";

/** Read and write fixed size byte arrays, but return a reference only valid until the next call per constructed codec. */
export function BytesRef(size: number, label = ""): Codec<Uint8Array> {
  const labelStr = `BytesRef[${size}](${label})`;
  const zcbuf = new ZeroCopyBuf(size);
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
      return await zcbuf.fillExactFrom(source);
    },
  };
}

/** Read and write fixed size byte arrays, useful in structs but otherwise
 * use `readN`.
 */
export function Bytes(size: number, label = ""): Codec<Uint8Array> {
  const underlying = BytesRef(size, label);
  return {
    label: `Bytes[${size}](${label})`,
    writeTo: underlying.writeTo,
    readFrom: async (source) => (await underlying.readFrom(source)).slice(0),
  };
}

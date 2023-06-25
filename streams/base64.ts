/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

import { ChunksStream } from "./chunks.ts";
import { MapStream } from "./map.ts";
import { PipelineStream } from "./pipe.ts";

const ENCODER_ORACLE = new TextEncoder().encode(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
);
const DECODER_ORACLE = new Uint8Array(128);

for (const [i, c] of ENCODER_ORACLE.entries()) {
  DECODER_ORACLE[c] = i;
}

export class Base64EncoderStream extends PipelineStream<[
  TransformStream<Uint8Array, Uint8Array>,
  TransformStream<Uint8Array, Uint8Array>,
]> {
  constructor() {
    super(
      new ChunksStream(3),
      new MapStream(chunk => {
        const out = new Uint8Array([61, 61, 61, 61]);
        out[0] = ENCODER_ORACLE[chunk[0] >> 2];
        out[1] = ENCODER_ORACLE[(chunk[0] << 4 | chunk[1] >> 4) & 0x3F];
        if (chunk[1] !== undefined) {
          out[2] = ENCODER_ORACLE[(chunk[1] << 2 | chunk[2] >> 6) & 0x3F];
        }
        if (chunk[2] !== undefined) {
          out[3] = ENCODER_ORACLE[chunk[2] & 0x3F];
        }
        return out;
      }),
    );
  }
}

export class Base64DecoderStream extends PipelineStream<[
  TransformStream<Uint8Array, Uint8Array>,
  TransformStream<Uint8Array, Uint8Array>,
]> {
  constructor() {
    super(
      new ChunksStream(4),
      new MapStream(chunk => {
        const pad = +(chunk.at(-1) == 61) + +(chunk.at(-2) == 61);
        const out = new Uint8Array(3 - pad);
        out[0] = DECODER_ORACLE[chunk[0]] << 2 | DECODER_ORACLE[chunk[1]] >> 4;
        out[1] = DECODER_ORACLE[chunk[1]] << 4 | DECODER_ORACLE[chunk[2]] >> 2;
        out[2] = DECODER_ORACLE[chunk[2]] << 6 | DECODER_ORACLE[chunk[3]];
        return out;
      }),
    );
  }
}

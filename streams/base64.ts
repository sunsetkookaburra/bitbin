/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

import { chunks, zip } from "../iter.ts";
import { ChunksStream } from "./chunks.ts";
import { MapStream } from "./map.ts";
import { pipe } from "./pipe.ts";

const ENCODER_ORACLE = new TextEncoder().encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
const DECODER_ORACLE = new Uint8Array(128);

for (const [i, c] of ENCODER_ORACLE.entries()) {
  DECODER_ORACLE[c] = i;
}

export class Base64EncoderStream implements TransformStream<Uint8Array, Uint8Array> {
  // #remainder: number[] = [];
  readonly writable: WritableStream<Uint8Array>;
  readonly readable: ReadableStream<Uint8Array>;

  constructor() {
    const transform = pipe(new ChunksStream(3), new MapStream((item) => {}));
    this.readable = transform.readable;

    const multipled = new ChunksStream(3);
    const outputStream = multipled.readable.pipeThrough(new TransformStream({
      transform: (chunk, controller) => {
        const out = new Uint8Array([61,61,61,61]);
        out[0] = ENCODER_ORACLE[chunk[0] >> 2];
        out[1] = ENCODER_ORACLE[(chunk[0] << 4 | chunk[1] >> 4) & 0x3F];
        if (chunk[1] !== undefined) out[2] = ENCODER_ORACLE[(chunk[1] << 2 | chunk[2] >> 6) & 0x3F];
        if (chunk[2] !== undefined) out[3] = ENCODER_ORACLE[chunk[2] & 0x3F];
        controller.enqueue(out);
      },
    }));
    this.writable = multipled.writable;
    this.readable = outputStream;
    return new TransformStream();
  }
}

export class Base64DecoderStream extends TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    super({
      transform: (chunk, controller) => {
        // console.log(chunk);
        const pad = +(chunk[chunk.byteLength - 1] == 61) + +(chunk[chunk.byteLength - 2] == 61)
        const nBytes = chunk.byteLength / 4 * 3 - pad;
        const out = new Uint8Array(nBytes);
        let nWritten = 0;
        for (let i = 0; i < chunk.byteLength; i += 4) {
          out[nWritten] = DECODER_ORACLE[chunk[i]] << 2 | DECODER_ORACLE[chunk[i + 1]] >> 4;
          out[nWritten + 1] = DECODER_ORACLE[chunk[i + 1]] << 4 | DECODER_ORACLE[chunk[i + 2]] >> 2;
          out[nWritten + 2] = DECODER_ORACLE[chunk[i + 2]] << 6 | DECODER_ORACLE[chunk[i + 3]];
          nWritten += 3;
        }
        controller.enqueue(out);
      },
    });
  }
}

// const buf = new Uint8Array([73, 153, 43, 31]);
// const enc = await new Response(new Response(buf).body!.pipeThrough(new Base64EncoderStream())).text();
// console.log("Enc", enc);
// const dec = new Uint8Array(await new Response(new Response(enc).body!.pipeThrough(new Base64DecoderStream())).arrayBuffer());
// console.log("Dec", dec);

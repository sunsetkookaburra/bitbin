/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

import { chunks, zip } from "../iter.ts";

export class ChunksStream extends TransformStream<Uint8Array, Uint8Array> {
  #buffer: number[] = [];
  constructor(chunkSize: number) {
    super({
      transform: (chunk, controller) => {
        for (const slice of chunks(chunkSize, zip(this.#buffer.values(), chunk.values()))) {
          if (slice.length == chunkSize) {
            controller.enqueue(new Uint8Array(slice));
          } else {
            this.#buffer = slice
          }
        }
      },
      flush: (controller) => {
        if (this.#buffer.length > 0) controller.enqueue(new Uint8Array(this.#buffer));
      }
    });
  }
}

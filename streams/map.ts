/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

export class MapStream<T, U> extends TransformStream<T, U> {
  constructor(mapFn: (item: T) => U | Promise<U>) {
    super({
      transform: async (chunk, controller) => {
        controller.enqueue(await mapFn(chunk));
      },
    });
  }
}

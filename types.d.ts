/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

export interface Codec<T> {
  label: string;
  writeTo(
    sink: { writable: WritableStream<Uint8Array> },
    value: T,
  ): Promise<void>;
  readFrom(source: { readable: ReadableStream<Uint8Array> }): Promise<T>;
}

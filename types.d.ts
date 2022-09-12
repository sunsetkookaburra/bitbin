/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

export interface ByteSink {
  readonly writable: WritableStream<Uint8Array>;
}

export interface ByteSource {
  readonly readable: ReadableStream<Uint8Array>;
}

export interface Codec<T> {
  readonly label: string;
  readonly writeTo: (sink: ByteSink, value: T) => Promise<void>;
  readonly readFrom: (source: ByteSource) => Promise<T>;
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

/** A destination for stream data, such as a `Response` body. */
export interface Sink<T> {
  readonly writable: WritableStream<T>;
}

/** A source of stream data such as a `Request` body. */
export interface Source<T> {
  readonly readable: ReadableStream<T>;
}

/** A `Codec<T>` implements a binary data encoder and decoder
 * which can read and write data of type `T`. It may also
 * provide a `label` for debugging purposes.
 *
 * ```ts
 * const MyCodec: Codec<number> = { ... };
 * // ...
 * await MyCodec.writeTo(writableStreamSink, 42);
 * // ...
 * const x: number = await MyCodec.readFrom(readableByteStreamSource);
 * ```
 */
export interface Codec<T> {
  readonly label?: string;
  readonly writeTo: (sink: Sink<Uint8Array>, value: T) => Promise<void>;
  readonly readFrom: (source: Source<Uint8Array>) => Promise<T>;
}

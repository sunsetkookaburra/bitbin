/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

/** A destination for binary data, such as a file or `Response` body. */
export interface ByteSink {
  readonly writable: WritableStream<Uint8Array>;
}

/** A source of binary data such as a file or `Request` body.
 * It should have implement a BYOB `ReadableStream`. */
export interface ByteSource {
  readonly readable: ReadableStream<Uint8Array>;
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
  readonly writeTo: (sink: ByteSink, value: T) => Promise<void>;
  readonly readFrom: (source: ByteSource) => Promise<T>;
}

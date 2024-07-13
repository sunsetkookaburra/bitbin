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

/** An `Enc<T>` implements a binary data encoder
 * which can write data of type `T`. It may also
 * provide a `label` for debugging purposes.
 *
 * ```ts
 * const U8: Enc<number> = {
 *   writeTo: async (sink: Sink<Uint8Array>, value: number) => {
 *     await write(sink, new Uint8Array([value]));
 *   },
 * };

 * const buf = new Buffer();
 * await MyCodec.writeTo(buf, 42);
 *
 * buf.bytes()[0] === 42; // true
 * ```
 */
export interface Enc<T> {
  readonly label?: string,
  readonly writeTo: (sink: Sink<Uint8Array>, value: T) => Promise<void>;
}

/** A `Dec<T>` implements a binary data decoder
 * which can read data of type `T`. It may also
 * provide a `label` for debugging purposes.
 *
 * ```ts
 * const U8: Dec<number> = {
 *   readFrom: async (sink: Sink<Uint8Array>) => {
 *     return (await readBytes(sink, 1))[0]
 *   },
 * };

 * const buf = new Buffer([42]);
 *
 * await U8.readFrom(buf) === 42; // true
 * ```
 */
export interface Dec<T> {
  readonly label?: string,
  readonly readFrom: (source: Source<Uint8Array>) => Promise<T>;
}

/** A convenience type on `Enc<T> & Dec<T>`,
 * a `Codec<T>` implements a binary data encoder and decoder
 * which can read and write data of type `T`.
 * It may also provide a `label` for debugging purposes.
 *
 * ```ts
 * const U8: Codec<number> = {
 *   writeTo: async (sink: Sink<Uint8Array>, value: number) => {
 *     await write(sink, new Uint8Array([value]));
 *   },
 *   readFrom: async (sink: Sink<Uint8Array>) => {
 *     return (await readBytes(sink, 1))[0]
 *   },
 * };
 *
 * const buf = new Buffer();
 *
 * await U8.writeTo(buf, 42);
 * buf.bytes()[0] === 42; // true
 *
 * await U8.readFrom(buf) === 42; // true
 * ```
 */
export interface Codec<T> extends Enc<T>, Dec<T> {}

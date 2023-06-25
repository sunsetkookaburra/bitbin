/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

type WriteType<T> = T extends [TransformStream<infer I>, ...unknown[]] ? I : never;
type ReadType<T> = T extends [...unknown[], TransformStream<unknown, infer O>] ? O : never;

/** A pipe-checker that validates (correctly re-writes) a theoretical pipeline */
type Transforms<T> = (
  // Suppose some tuple 'T'
  T extends [TransformStream<infer I, infer M>, TransformStream<unknown, infer N>, ...infer Rest extends [...TransformStream[]]]
  // To be correct, it should look like any of the following terminals/leafs ...
  ? [TransformStream<I, M>, ...Transforms<[TransformStream<M, N>, ...Rest]>]
  : T extends [TransformStream] ? T : [...TransformStream[]]
);

export class PipelineStream<T = [TransformStream, ...TransformStream[]]> implements TransformStream<WriteType<T>, ReadType<T>> {
  #writable: WritableStream<WriteType<T>>;
  #readable: ReadableStream<ReadType<T>>;

  constructor(...transforms: Transforms<T> & [TransformStream, ...TransformStream[]]) {
    this.#writable = transforms[0].writable;
    this.#readable = transforms[0].readable;
    for (let i = 1; i < transforms.length; ++i) {
      this.#readable = this.#readable.pipeThrough(transforms[i]);
    }
  }

  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

type Tuple<T = unknown> = { [K in keyof T]: T[K] } & unknown[];
// type Tuple = [{ [K in keyof T]: T[K] } & unknown[]];
type Head<T extends Tuple> = T extends [infer U, ...unknown[]] ? U : never;
type Tail<T extends Tuple> = T extends [...unknown[], infer U] ? U : never;
export type Fn<Args extends Tuple = Tuple, Ret = unknown> = (...args: Args) => Ret;
export type Args<F extends Fn> = F extends Fn<infer A, unknown> ? A : never;
export type Ret<F extends Fn> = F extends Fn<Tuple, infer R> ? R : never;

type Pipeline<I, T> = T extends [TransformStream<I, infer O>, ...infer Tail extends TransformStream[]] ? [TransformStream<I, O>, ...Pipeline<O, Tail>] : [];

type x = Pipeline<"A", [TransformStream<"A", "B">, TransformStream<"B", "D">]>;

export function pipe<I, A extends TransformStream[]>(...transforms: Pipeline<I, A>) {

}

// let y = pipe(new TransformStream<"A", "B">());

// export function pipe<I, M, O, T extends Tuple<[TransformStream<I, unknown>, ...TransformStream[]] | [...TransformStream[], TransformStream<unknown, M>, TransformStream<M, unknown>, ...TransformStream[]] | [...TransformStream[], TransformStream<unknown,O>]>>(
//   ...transforms: T
// ): TransformStream<
//   Head<T> extends TransformStream<infer I, unknown> ? I : never,
//   Tail<T> extends TransformStream<unknown, infer O> ? O : never
// > {
//   const writable = transforms[0].writable;
//   let readable = transforms[0].readable;
//   for (let i = 1; i < transforms.length; ++i) {
//     readable = readable.pipeThrough(transforms[i]);
//   }
//   return { writable, readable };
// }

// let x = pipe(new TransformStream<"A","B">(), new TransformStream<"E","D">())

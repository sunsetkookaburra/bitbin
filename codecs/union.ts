/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, ZeroCopyBuf, Buffer, write, asBytes } from "../mod.ts";

// export function Union<T>(size: number, discriminant: Codec<number>, layouts: Record<number, Codec<T>>): Codec<T> {
//   const zcbuf = new ZeroCopyBuf(size);
//   let shape = "";
//   JSON.stringify(layouts, (k, v) => { shape += `<${k},${v}>`; return v; });
//   console.log(shape);
//   return {
//     writeTo: async (sink, value) => {
//       await write(sink, asBytes(zcbuf));
//     },
//     readFrom: async (source) => {
//       await zcbuf.fillExactFrom(source);
//       const cursor = new Buffer(asBytes(zcbuf));
//       const type = await discriminant.readFrom(cursor);
//       return await layouts[type].readFrom(cursor);
//     },
//   };
// }

// Union(23, (await import("./primitive.ts")).Int8, {
//   0: (await import("./primitive.ts")).Int8
// })

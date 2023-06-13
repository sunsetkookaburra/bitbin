/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

// import { Codec } from "../mod.ts"

// BitStream

// /** Encodes and decodes packet bit-fields, using `Math.ceil(nbits / 8) * 8` bytes. */
// export function BitField<T extends Record<string, number>>(structure: T, label = ""): Codec<T> {
//   let nbits = 0;
//   for (const k in structure) {
//     nbits += structure[k];
//   }
//   const nbytes = Math.ceil(nbits / 8) * 8;
//   const buf = new Uint8Array(nbytes);
//   return {
//     label: `BitField(${label})`,
//     writeTo: async (sink, value) => {
//       for (const k in structure) {

//       }
//     },
//   };
// }

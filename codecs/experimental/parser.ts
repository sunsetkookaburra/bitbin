/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec } from "../mod.ts";
import { Uint16 } from "./mod.ts";

// @ts-ignore a
function Parser<T, U>(
  codec: Codec<T>,
  map: (value: T) => U,
): Codec<U> & { (): void } {}

Parser(Uint16.be, (v) => 2);

/*

const LpUtf8 = Parser.step(Uint16.be, v => Utf8(v)).save((v, w) => {
  const txt = Utf8.
  w.write()
});

LpUtf8.writeTo(sink, "Hello, World!");

*/

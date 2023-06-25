// deno-lint-ignore-file

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, readN, write } from "../../mod.ts";
import { Bytes } from "../bytes.ts";
import {
  Float32,
  Int16,
  Struct,
  Uint16,
  Uint32,
  Uint8,
  Utf8,
} from "./../mod.ts";

const BitmapFileHeader = Struct({
  magic: Utf8(2),
  size: Uint32.le,
  _r1: Uint16.le,
  _r2: Uint16.le,
  offset: Uint32.le,
});

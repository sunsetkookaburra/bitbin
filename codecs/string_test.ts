/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { CString } from "./string.ts";
import { Buffer } from "../mod.ts";

Deno.test("CString read", async () => {
  assertEquals(
    await CString.readFrom(
      new Buffer(new TextEncoder().encode("foo bar\0baz")),
    ),
    "foo bar",
  );
});

Deno.test("CString read empty", async () => {
  assertEquals(
    await CString.readFrom(new Buffer(new Uint8Array([0]))),
    "",
  );
});

Deno.test("CString write", async () => {
  const sink = new Buffer();
  await CString.writeTo(sink, "hello world"),
    assertEquals(
      sink.bytes({ copy: false }),
      new TextEncoder().encode("hello world\0"),
    );
});

Deno.test("CString write empty", async () => {
  const sink = new Buffer();
  await CString.writeTo(sink, ""),
    assertEquals(
      sink.bytes({ copy: false }),
      new Uint8Array([0]),
    );
});

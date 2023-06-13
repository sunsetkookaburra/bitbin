/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2023 */

import { assertEquals } from "../deps.ts";
import { Base64DecoderStream, Base64EncoderStream } from "./base64.ts";

Deno.test({
  name: "[streams/base64] Encode-Decode Fuzz",
  fn: async () => {
    for (let i = 0; i < 10; ++i) {
      const buf = new Uint8Array(i);
      crypto.getRandomValues(buf);
      const enc = new Uint8Array(
        await new Response(
          new Response(buf).body?.pipeThrough(new Base64EncoderStream()),
        ).arrayBuffer(),
      );
      const dec = new Uint8Array(
        await new Response(
          new Response(enc).body?.pipeThrough(new Base64DecoderStream()),
        ).arrayBuffer(),
      );
      assertEquals(dec, buf);
    }
  },
});

Deno.test({
  name: "[streams/base64] Decode-Encode Fuzz",
  fn: async () => {
    // for (let i = 0; i < 10; ++i) {
      // const buf = new Uint8Array(i);
      // crypto.getRandomValues(buf);
      // const enc = new Uint8Array(
      //   await new Response(
      //     new Response(buf).body?.pipeThrough(new Base64EncoderStream()),
      //   ).arrayBuffer(),
      // );
      // const dec = new Uint8Array(
      //   await new Response(
      //     new Response(enc).body?.pipeThrough(new Base64DecoderStream()),
      //   ).arrayBuffer(),
      // );
      // assertEquals(dec, buf);
    // }
  },
});

#!/usr/bin/env -S deno run -r

import { writeFull } from "https://deno.land/x/bitbin/mod.ts";
import { Uint8, Utf8 } from "https://deno.land/x/bitbin/formats/mod.ts";
import { Buffer } from "https://deno.land/std@0.155.0/streams/buffer.ts";

const buf = new Buffer();
const enc = new TextEncoder().encode("Hello, World!");

await Uint8.writeTo(buf, enc.byteLength);
await writeFull(buf, enc);

const size = await Uint8.readFrom(buf);
const text = await Utf8(size).readFrom(buf);

console.log(text);

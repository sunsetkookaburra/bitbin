import { Buffer, write } from "https://deno.land/x/bitbin/mod.ts";
import { Uint8, Utf8 } from "https://deno.land/x/bitbin/formats/mod.ts";

const buf = new Buffer();
const enc = new TextEncoder().encode("Hello, World!");

await Uint8.writeTo(buf, enc.byteLength);
await write(buf, enc);

const size = await Uint8.readFrom(buf);
const text = await Utf8(size).readFrom(buf);

console.log(text);

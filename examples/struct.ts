import { Buffer } from "https://deno.land/x/bitbin/mod.ts";
import {
  CString,
  Float32,
  Int8,
  Struct,
} from "https://deno.land/x/bitbin/formats/mod.ts";

const Player_t = Struct({
  age: Int8,
  name: CString,
  score: Float32.be,
});

const sink = new Buffer();
await Player_t.writeTo(sink, {
  age: 23,
  name: "Joe Bloggs",
  score: 42.3,
});

console.log(sink.bytes({ copy: false }));
console.log(await Player_t.readFrom(sink));

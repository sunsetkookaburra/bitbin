# Bit Bin

> Garbage In, Garbage Out!

Encode and decode binary data formats using TypeScript and the Web Streams API.

## Available Data Types

`Uint8`, `Uint16`, `Uint32`, `BigUint64`, `Int8`, `Int16`, `Int32`, `BigInt64`,
`Bytes`, `Struct`, `Tuple`, `Vec`, `Utf8`

## Examples

Also see [examples/](./examples/) directory.

```ts
import { Buffer, write } from "https://deno.land/x/bitbin/mod.ts";
import { Uint8, Utf8 } from "https://deno.land/x/bitbin/formats/mod.ts";

const buf = new Buffer();
const enc = new TextEncoder().encode("Hello, World!");

await Uint8.writeTo(buf, enc.byteLength);
await write(buf, enc);

const size = await Uint8.readFrom(buf);
const text = await Utf8(size).readFrom(buf);

console.log(text);
```

```ts
import { Buffer } from "https://deno.land/x/bitbin/mod.ts";
import { Struct, Int8, Float32, CString }
  from "https://deno.land/x/bitbin/formats/mod.ts";

const Player_t = Struct({
  age: Int8,
  name: CString,
  score: Float32.be,
});

const sink = new Buffer();
const joe = Player_t.writeTo(sink, {
  age: 23,
  name: "Joe Bloggs",
  score: 42.3,
});

console.log(sink.bytes());
console.log(Player_t.readFrom(sink));
```

## License

Available under the [Mozilla Public License v2.0](./LICENSE).

Use of Deno Standard Library utilities (`Buffer`) under
[MIT License](https://github.com/denoland/deno_std/blob/main/LICENSE).

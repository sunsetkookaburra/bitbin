# Bit Bin

> Garbage In, Garbage Out!

Encode and decode binary data formats using TypeScript and the Web Streams API.

## Available Data Types

`Uint8`, `Uint16`, `Uint32`, `BigUint64`, `Int8`, `Int16`, `Int32`, `BigInt64`,
`Bytes`, `Struct`, `Tuple`, `Vec`, `Utf8`

## Example

```ts
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
```

## License

Available under the [Mozilla Public License v2.0](./LICENSE).

Use of Deno Standard Library utilities (`Buffer`) under
[MIT License](https://github.com/denoland/deno_std/blob/main/LICENSE).

# Bit Bin

> Garbage In, Garbage Out!

Encode and decode binary data structures using TypeScript and the Web Streams
API.

**Note:** Prefer using explicit version tag (e.g. `@0.0.4`), especially since
`0.0.*` versions are likely to contain small but breaking changes while the API
is being settled.

## Available Data Types

`Uint8`, `Uint16`, `Uint32`, `BigUint64`, `Int8`, `Int16`, `Int32`, `BigInt64`,
`Bytes`, `BytesRef`, `Struct`, `Tuple`, `Vec`, `Utf8`, `CString`

## Available Utilities

```ts
// util.ts
function bytes(source: BufferSource): Uint8Array;
function cat(arrays: BufferSource[]): Uint8Array;
function view(source: BufferSource): DataView;

// mod.ts
const SYSTEM_ENDIAN: Endian;
async function readFull(
  source: Source<Uint8Array>,
  buffer: ArrayBuffer,
): Promise<ArrayBuffer>;
async function readN(
  source: Source<Uint8Array>,
  n: number,
): Promise<Uint8Array>;
async function write<T>(
  sink: Sink<T>,
  chunk: T,
): Promise<void>;
```

## Examples

Also see [examples/](./examples/) directory.

```ts
import { Buffer, write } from "https://deno.land/x/bitbin@0.0.4/mod.ts";
import { Uint8, Utf8 } from "https://deno.land/x/bitbin@0.0.4/formats/mod.ts";

const buf = new Buffer();
const enc = new TextEncoder().encode("Hello, World!");

await Uint8.writeTo(buf, enc.byteLength);
await write(buf, enc);

const size = await Uint8.readFrom(buf);
const text = await Utf8(size).readFrom(buf);

console.log(text);
```

```ts
import { Buffer } from "https://deno.land/x/bitbin@0.0.4/mod.ts";
import {
  CString,
  Float32,
  Int8,
  Struct,
} from "https://deno.land/x/bitbin@0.0.4/formats/mod.ts";

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

console.log(sink.bytes());
console.log(await Player_t.readFrom(sink));
```

## License

Available under the [Mozilla Public License v2.0](./LICENSE).

Use of Deno Standard Library utilities (`Buffer`) under
[MIT License](https://github.com/denoland/deno_std/blob/main/LICENSE).

import {
  Buffer,
  asBytes,
  Codec,
  ZeroCopyBuf,
  write,
} from "https://deno.land/x/bitbin/mod.ts";
import {
  Float32,
  Int32,
  Struct,
} from "https://deno.land/x/bitbin/formats/mod.ts";

/** Encodes and decodes UTF-8 text as null terminated strings.
 * Ensures they fit, including the terminator, otherwise
 * truncates. */
export function CStrArr(size: number): Codec<string> {
  const zcbuf = new ZeroCopyBuf(size);
  return {
    label: `CStringFixed[${size}]`,
    writeTo: async (sink, value) => {
      const u8view = asBytes(zcbuf);
      if (value.includes("\0")) {
        throw new Error("Input 'value' cannot contain nul");
      }
      const len =
        new TextEncoder().encodeInto(value, u8view.subarray(0, -1)).written;
      u8view[len] = 0;
      await write(sink, u8view);
    },
    readFrom: async (source) => {
      const u8view = asBytes(await zcbuf.fillExactFrom(source));
      const len = u8view.findIndex((v) => v == 0);
      return new TextDecoder().decode(
        u8view.subarray(0, len != -1 ? len : u8view.byteLength),
      );
    },
  };
}

const Player_t = Struct({
  age: Int32.be,
  name: CStrArr(24),
  score: Float32.be,
});

const sink = new Buffer();
await Player_t.writeTo(sink, {
  age: 27,
  name: "Joe Bloggs",
  score: 42.3,
});

console.log(sink.bytes());
console.log(await Player_t.readFrom(sink));

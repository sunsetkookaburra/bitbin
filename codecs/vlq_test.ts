import { Buffer } from "../mod.ts";
import { Uvarint } from "./mod.ts";
import { assertEquals, assertRejects } from "https://deno.land/std@0.178.0/testing/asserts.ts";

Deno.test({
  name: "vlq_UvarintSingleByte",
  async fn() {
    const src = new Buffer(new Uint8Array([0x7F]));
    const num = await Uvarint.readFrom(src);
    assertEquals(num, 127n);
  },
});

Deno.test({
  name: "vlq_UvarintDoubleByte",
  async fn() {
    const src = new Buffer(new Uint8Array([0xFF, 0x01]));
    const num = await Uvarint.readFrom(src);
    assertEquals(num, 255n);
  },
});

Deno.test({
  name: "vlq_UvarintEOF",
  fn() {
    const src = new Buffer(new Uint8Array([0x81]));
    assertRejects(() => Uvarint.readFrom(src));
  },
});

Deno.test({
  name: "vlq_UvarintEncodeSingleByte",
  async fn() {
    const sink = new Buffer();
    await Uvarint.writeTo(sink, 127n);
    assertEquals(sink.bytes({ copy: false }), new Uint8Array([0x7F]))
  }
});

Deno.test({
  name: "vlq_UvarintEncodeDoubleByte",
  async fn() {
    const sink = new Buffer();
    await Uvarint.writeTo(sink, 255n);
    assertEquals(sink.bytes({ copy: false }), new Uint8Array([0xFF, 0x01]))
  }
});

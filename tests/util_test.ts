import { assert, assertEquals, assertNotEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { Buffer } from "https://deno.land/std@0.155.0/streams/buffer.ts";
import {
  view,
  bytes,
  cat,
  SYSTEM_ENDIAN,
  readFull,
  readN,
  write,
} from "../mod.ts";
import {
  Utf8
} from "../formats/mod.ts";

Deno.test({
  name: "view(BufferSource)",
  fn() {
    const buf1 = new Uint8Array([1,2,3,4]);
    const buf2 = buf1.subarray(2);
    const view1 = view(buf1);
    const view2 = view(buf2);
    assert(view1.buffer === view2.buffer);
    assertEquals(view1.byteOffset, buf1.byteOffset);
    assertEquals(view1.byteLength, buf1.byteLength);
    assertEquals(view2.byteOffset, buf2.byteOffset);
    assertEquals(view2.byteLength, buf2.byteLength);
    assertEquals(view1.getUint16(0, true), 0x0201);
    assertEquals(view2.getUint16(0, true), 0x0403);
  },
});

Deno.test({
  name: "bytes(BufferSource)",
  fn() {
    const i16 = new Int16Array([0xABCD]);
    if (SYSTEM_ENDIAN == "be") {
      assertEquals(bytes(i16), new Uint8Array([0xAB, 0xCD]));
    } else if (SYSTEM_ENDIAN == "le") {
      assertEquals(bytes(i16), new Uint8Array([0xCD, 0xAB]));
    } else {
      assert(false);
    }
  },
});

Deno.test({
  name: "cat([...BufferSource])",
  fn() {
    assertEquals(cat([new Uint8Array([4,2,8,6]), new Uint8Array([9,3,6,1])]), new Uint8Array([4,2,8,6,9,3,6,1]));
  },
});

Deno.test({
  name: "SYSTEM_ENDIAN",
  fn() {
    const i16 = new Int16Array([0x1337]);
    const buf = new Uint8Array(i16.buffer, i16.byteOffset, i16.byteLength);
    if (SYSTEM_ENDIAN == "be") {
      assertEquals(buf, new Uint8Array([0x13, 0x37]));
    } else if (SYSTEM_ENDIAN == "le") {
      assertEquals(buf, new Uint8Array([0x37, 0x13]));
    } else {
      assert(false);
    }
  },
});

Deno.test({
  name: "Utf8",
  async fn() {
    const source = new Buffer(new Uint8Array([0x30, 0x41, 0x08, 0x0A, 0x00, 0xFF, 0x80]));
    assertEquals(await Utf8(7).readFrom(source), "0A\b\n\0\uFFFD\uFFFD");
  },
});


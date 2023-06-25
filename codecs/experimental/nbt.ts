/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * Copyright (C) Oliver Lenehan (sunsetkookaburra), 2022 */

import { Codec, DecodeError, Sink, Source, write } from "../../mod.ts";
import {
  BigInt64,
  Bytes,
  Float32,
  Float64,
  Int16,
  Int32,
  Int8,
  Uint16,
  Uint8,
  Vec,
} from "../mod.ts";

const NBTString: Codec<string> = {
  label: "NBTString",
  writeTo: async (sink, value) => {
    const txt = new TextEncoder().encode(value);
    await Uint16.be.writeTo(sink, txt.byteLength);
    await write(sink, txt);
  },
  readFrom: async (source) => {
    const size = await Uint16.be.readFrom(source);
    const txt = await Bytes(size).readFrom(source);
    return new TextDecoder().decode(txt);
  },
};

// deno-lint-ignore no-explicit-any
type TAGType = any;

class TAG implements Codec<TAGType> {
  static readonly End = 0;
  static readonly Byte = 1;
  static readonly Short = 2;
  static readonly Int = 3;
  static readonly Long = 4;
  static readonly Float = 5;
  static readonly Double = 6;
  static readonly Byte_Array = 7;
  static readonly String = 8;
  static readonly List = 9;
  static readonly Compound = 10;
  static readonly Int_Array = 11;
  static readonly Long_Array = 12;

  label: string;

  constructor(public readonly type: number, private implicitEnd = false) {
    this.label = `TAG(id:${type})`;
  }

  writeTo(
    _sink: Sink<Uint8Array>,
    _value: TAGType,
  ): Promise<void> {
    // return Promise.reject(new Error("Not implemented"));
    throw new Error("Not implemented");
  }

  async readFrom(
    source: Source<Uint8Array>,
  ): Promise<TAGType> {
    switch (this.type) {
      case TAG.End:
        return NaN;
      case TAG.Byte:
        return await Int8.readFrom(source);
      case TAG.Short:
        return await Int16.be.readFrom(source);
      case TAG.Int:
        return await Int32.be.readFrom(source);
      case TAG.Long:
        return await BigInt64.be.readFrom(source);
      case TAG.Float:
        return await Float32.be.readFrom(source);
      case TAG.Double:
        return await Float64.be.readFrom(source);
      case TAG.String:
        return await NBTString.readFrom(source);
      case TAG.Byte_Array: {
        const size = await Int32.be.readFrom(source);
        return await Vec(Int8, size).readFrom(source);
      }
      case TAG.Int_Array: {
        const size = await Int32.be.readFrom(source);
        return await Vec(Int32.be, size).readFrom(source);
      }
      case TAG.Long_Array: {
        const size = await Int32.be.readFrom(source);
        return await Vec(BigInt64.be, size).readFrom(source);
      }
      case TAG.List: {
        const tag = new TAG(await Uint8.readFrom(source));
        const len = await Int32.be.readFrom(source);
        return await Vec(tag, len).readFrom(source);
      }
      case TAG.Compound: {
        const obj = {} as Record<string, TAGType>;
        while (true) {
          let type;
          try {
            type = await Uint8.readFrom(source);
          } catch (e: unknown) {
            if (e instanceof DecodeError && this.implicitEnd) break;
            else throw e;
          }
          if (type == TAG.End) {
            break;
          } else if (type > 12 || type < 0) {
            throw new DecodeError("Invalid NBT data: Unexpected type");
          }
          const name = await NBTString.readFrom(source);
          const payload = await new TAG(type).readFrom(source);
          obj[name] = payload;
        }
        return obj;
      }
      default:
        throw new Error("Unreachable Reached");
    }
  }
}

export const NBT: Codec<Record<string, TAGType>> = {
  label: "NBT",
  writeTo: (_sink, _value) => {
    throw new Error("Not implemented");
  },
  readFrom: async (source) => {
    return await new TAG(TAG.Compound, true).readFrom(source);
  },
};

import { NBT } from "./nbt.ts";

const file = await Deno.open("hello_world.nbt");
console.log(await NBT.readFrom(file));

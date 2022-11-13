import { Uint8 } from "./formats/mod.ts";
const f = Deno.openSync("bug.ts");
try {while (true) await Uint8.readFrom(f);}catch(e){console.log(e)}
await Uint8.readFrom(f);
f.close();

// TODO: Buffer / transform type that allows inserting items at start of queue

import { DecodeError } from "../../mod.ts";

/** Return the number of bytes in the c-string (excluding null `\0`). */
export function strlen(data: Uint8Array): number {
  let len = 0;
  while (data[len] != 0) {
    if (data[len] === undefined) {
      throw new DecodeError(
        "Invalid CString (no null terminator before end of data)",
      );
    }
    ++len;
  }
  return len;
}

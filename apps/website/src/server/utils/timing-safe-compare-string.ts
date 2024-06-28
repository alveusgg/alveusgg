import { timingSafeEqual } from "node:crypto";

// Perform a timing-safe string comparison
export default function timingSafeCompareString(a: string, b: string) {
  const bufferA = Buffer.from(a, "utf16le");
  const bufferB = Buffer.from(b, "utf16le");
  if (bufferA.byteLength !== bufferB.byteLength) {
    timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

import { timingSafeEqual } from "node:crypto";

// Perform a timing-safe string comparison
export default function timingSafeCompareString(a: string, b: string) {
  const arrayA = new TextEncoder().encode(a);
  const arrayB = new TextEncoder().encode(b);
  if (arrayA.length !== arrayB.length) {
    timingSafeEqual(arrayA, arrayA);
    return false;
  }

  return timingSafeEqual(arrayA, arrayB);
}

export function concatArrayBuffers(buffers: ArrayBuffer[]) {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return result.buffer;
}

export function readNumberFromUintArrayBE(source: Uint8Array) {
  let result = 0;
  let base = 1;
  for (const byte of source.reverse()) {
    result += base * byte;
    base *= 256;
  }
  return result;
}

export function createUintArrayBEFromNumber(x: number, byteLength: number) {
  const result = new Uint8Array(byteLength);
  let i = 0;
  while (x > 0) {
    result[i] = Number(x % 256);
    x = x / 256;
    i += 1;
  }
  return result.reverse();
}

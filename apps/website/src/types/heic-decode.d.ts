declare module "heic-decode" {
  interface DecodeOptions {
    buffer: Buffer;
  }

  interface DecodedImage {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  function decode(options: DecodeOptions): Promise<DecodedImage>;
  function all(
    options: DecodeOptions,
  ): Promise<{ decode: () => Promise<DecodedImage> }[]>;

  export default decode;
  export { all };
}

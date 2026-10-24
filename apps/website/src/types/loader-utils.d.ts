declare module "loader-utils" {
  export function interpolateName(
    context: { resourcePath: string; resourceQuery?: string },
    name: string,
    options?: { context?: string; content?: Buffer },
  ): string;

  export function getHashDigest(content: Buffer, hashType?: string): string;
}

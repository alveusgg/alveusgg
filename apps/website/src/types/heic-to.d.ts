declare module "heic-to" {
  const heicTo: (options: {
    blob: File;
    type: string;
    quality?: number;
  }) => Promise<Blob>;
  export default heicTo;
}

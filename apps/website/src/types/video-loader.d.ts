declare module "*.mp4" {
  export default string;
}

declare module "*.mp4?quality=high" {
  export default string;
}

declare module "*.mp4?quality=low" {
  export default string;
}

declare module "*.md" {
  const content: string;
  export default content;
}

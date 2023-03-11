type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

interface VideoSource {
  src: string;
  size: number;
  type: string;
}

interface Video {
  poster: string;
  sources: VideoSource[];
}

declare const Video: Video;

declare module "*.mp4" {
  export default Video;
}

declare module "*.mp4?quality=high" {
  export default Video;
}

declare module "*.mp4?quality=low" {
  export default Video;
}

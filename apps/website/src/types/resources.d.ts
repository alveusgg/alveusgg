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

declare module '*.mp4' {
  export default Video;
}

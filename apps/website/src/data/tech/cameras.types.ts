import { type StaticImageData } from "next/image";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

export interface CameraData {
  title: string;
  group: string;
  presets: Record<string, Preset>;
}

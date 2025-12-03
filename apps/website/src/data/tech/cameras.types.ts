import { type StaticImageData } from "next/image";

export interface Preset {
  description: string;
  image: StaticImageData;
}

interface CameraCore {
  title: string;
  group: string;
}

export interface CameraPTZ extends CameraCore {
  presets: Record<string, Preset>;
}

export interface CameraMulti extends CameraCore {
  multi: {
    cameras: string[];
    description: string;
    image: StaticImageData;
  };
}

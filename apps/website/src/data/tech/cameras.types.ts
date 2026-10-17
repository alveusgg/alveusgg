export interface PresetImage {
  src: string;
  width: number;
  height: number;
}

export interface Preset {
  description: string;
  image: PresetImage | null;
  position: { pan: number; tilt: number; zoom: number };
  canLoad?: boolean;
  imageProvenance?: "legacy" | "capture" | null;
}

export type PresetEntry = readonly [string, Preset];

interface CameraCore {
  title: string;
  group: string;
}

export interface CameraPTZ extends CameraCore {
  presets: Record<string, Preset>;
}

export const isCameraPTZ = (cam: CameraPTZ | CameraMulti): cam is CameraPTZ =>
  "presets" in cam;

export interface CameraMulti extends CameraCore {
  multi: {
    cameras: string[];
  };
}

export const isCameraMulti = (
  cam: CameraPTZ | CameraMulti,
): cam is CameraMulti => "multi" in cam;

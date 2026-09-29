export interface Preset {
  position: { pan: number; tilt: number; zoom: number; focus?: number };
  autofocus?: "on" | "off";
}

const prefix = (camera: string) => `preset:${camera}:`;

/** Saved camera positions, stored per camera in the controller's storage. */
export class Presets {
  constructor(private storage: DurableObjectStorage) {}

  get(camera: string, name: string) {
    return this.storage.kv.get<Preset>(prefix(camera) + name);
  }

  set(camera: string, name: string, preset: Preset) {
    this.storage.kv.put(prefix(camera) + name, preset);
  }

  delete(camera: string, name: string) {
    return this.storage.kv.delete(prefix(camera) + name);
  }

  rename(camera: string, from: string, to: string) {
    const preset = this.get(camera, from);
    if (!preset) return false;
    this.set(camera, to, preset);
    this.delete(camera, from);
    return true;
  }

  names(camera: string) {
    const names: string[] = [];
    for (const [key] of this.storage.kv.list({ prefix: prefix(camera) })) {
      names.push(key.slice(prefix(camera).length));
    }
    return names.sort();
  }
}

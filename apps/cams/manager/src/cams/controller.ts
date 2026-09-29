import { createClient } from "@alveusgg/cams-control-client/client";
import { DurableObject, env } from "cloudflare:workers";

import { Camera } from "./camera.ts";
import { type Lock, Locks } from "./locks.ts";
import { Presets } from "./presets.ts";

export class CamControllerDurableObject extends DurableObject {
  locks: Locks;
  presets: Presets;
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.locks = new Locks(state.storage);
    this.presets = new Presets(state.storage);
  }

  dangerouslyForwardFetch(request: Request) {
    return env.CONTROL_API.fetch(request);
  }

  private camera(cameraName: string) {
    const client = createClient({
      baseUrl: "http://control.local",
      fetch: (request) => env.CONTROL_API.fetch(request),
      headers: { "x-camera-name": cameraName },
    });
    return new Camera(cameraName, client, this);
  }

  getByCameraName(cameraName: string) {
    return this.camera(cameraName);
  }

  getLock(cameraName: string) {
    return this.locks.get(cameraName);
  }

  lock(cameras: string[], lock: Lock) {
    for (const camera of cameras) this.locks.add(camera, lock);
  }

  unlock(cameras: string[]) {
    for (const camera of cameras) this.locks.delete(camera);
  }

  listLocks() {
    return this.locks.list().map(([camera, lock]) => ({ camera, ...lock }));
  }
}

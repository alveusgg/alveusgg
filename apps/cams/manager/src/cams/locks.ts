import type { Level } from "../permissions.ts";

export interface Lock {
  user: string;
  level: Level;
  /** Epoch milliseconds, or `null` for a lock that never expires */
  until: number | null;
}

const PREFIX = "ptz_lock:";

/** PTZ locks, stopping chatters below a level from moving a camera. */
export class Locks {
  constructor(private storage: DurableObjectStorage) {}

  get(camera: string) {
    const lock = this.storage.kv.get<Lock>(PREFIX + camera);
    if (lock?.until != null && lock.until <= Date.now()) {
      this.storage.kv.delete(PREFIX + camera);
      return undefined;
    }
    return lock;
  }

  /** Lock a camera, leaving any existing lock in place. */
  add(camera: string, lock: Lock) {
    if (this.get(camera)) return;
    this.storage.kv.put(PREFIX + camera, lock);
  }

  delete(camera: string) {
    this.storage.kv.delete(PREFIX + camera);
  }

  list() {
    const locks: [string, Lock][] = [];
    for (const [key] of this.storage.kv.list<Lock>({ prefix: PREFIX })) {
      const camera = key.slice(PREFIX.length);
      const lock = this.get(camera);
      if (lock) locks.push([camera, lock]);
    }
    return locks;
  }
}

import { DurableObject } from "cloudflare:workers";
import type { MTX } from "./setup";
import { setup } from "./setup";

export class MTXManager extends DurableObject {
  private mtx!: MTX;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.mtx = await setup(env, {
        dev_garden: {
          host: "garden.cam",
          dynamic: true,
          record: false,
        },
        garden: {
          host: "garden.cam",
          dynamic: false,
          record: true,
        },
      });
    });
  }

  async fetch(request: Request): Promise<Response> {
    return this.mtx.route.fetch(request);
  }

  async dispatch(action: string[], args: unknown[]): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any = this.mtx;
    for (const key of action) target = target[key];
    return target(...args);
  }
}

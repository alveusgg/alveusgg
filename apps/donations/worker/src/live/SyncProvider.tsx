import { produce } from "immer";

interface SyncProviderOptions<Context> {
  state: SyncProviderStateOptions<Context>;
  init: Context;
}

interface SyncProviderStateOptions<Context> {
  state?: Context;
  persistState: (state: Context) => Promise<void>;
}

export class SyncProvider<Context> {
  private context: Context;

  constructor(private options: SyncProviderOptions<Context>) {
    this.context = options.init;
    if (options.state.state) {
      this.context = options.state.state;
    }
  }

  update(fn: (context: Context) => void) {
    this.context = produce(this.context, fn);
    this.options.state.persistState(this.context);
  }

  public getContext() {
    return this.context;
  }
}

interface SyncProviderOptions<Context> {
  state: SyncProviderStateOptions<Context>;
  init: Context;
}

interface SyncProviderStateOptions<Context> {
  state?: Context;
}

export class SyncProvider<Context> {
  private context: Context;

  constructor(private options: SyncProviderOptions<Context>) {
    this.context = options.init;
    if (options.state.state) {
      this.context = options.state.state;
    }
  }

  update(fn: (context: Context) => Context) {
    this.context = fn(this.context);
  }

  public getContext() {
    return this.context;
  }
}

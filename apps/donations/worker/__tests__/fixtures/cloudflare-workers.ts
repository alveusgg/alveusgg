// Only the base constructor is needed by the routing tests. Storage and provider
// boundaries are mocked; these tests do not emulate the Workers runtime.
export class DurableObject<Env> {
  constructor(
    protected ctx: DurableObjectState,
    protected env: Env,
  ) {}
}

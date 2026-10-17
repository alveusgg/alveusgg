import { describe, expect, it, vi } from "vitest";
import { stringify } from "superjson";

vi.mock("@sentry/cloudflare", () => ({
  withSentry: (_config: unknown, handler: unknown) => handler,
  instrumentDurableObjectWithSentry: (_config: unknown, base: unknown) => base,
  setTags: vi.fn(),
}));
vi.mock("../src/managers/donations", () => ({
  DonationsManagerDurableObject: class {},
}));
vi.mock("../src/managers/pixels", () => ({
  PixelsManagerDurableObject: class {},
}));

const { default: handler } = await import("../src/index");
const worker = handler as ExportedHandler<Env, string>;

const donation = (id: string) => ({
  id,
  provider: "neon",
  providerUniqueId: `example-${id}`,
  receivedAt: new Date("2026-01-01T00:00:00Z"),
});

function setup(delivered: string[]) {
  const manager = {
    deliverDonations: vi.fn(async (donations: { id: string }[]) =>
      donations.filter((donation) => delivered.includes(donation.id)),
    ),
    deliverPixels: vi.fn(async () => []),
  };
  const env = {
    DONATIONS_MANAGER: { getByName: () => manager },
    PIXELS_QUEUE: { sendBatch: vi.fn() },
  } as unknown as Env;
  const batch = (queue: string, ids: string[]) =>
    ({
      queue,
      messages: ids.map((id) => ({ body: stringify(donation(id)) })),
    }) as unknown as MessageBatch<string>;
  return { manager, env, batch };
}

describe("queue consumers", () => {
  it("delivers donations through the manager and only forwards delivered ones to pixels", async () => {
    const { manager, env, batch } = setup(["1"]);
    const messages = batch("alveus-donations", ["1", "2"]);

    await worker.queue!(messages, env, {} as ExecutionContext);
    expect(manager.deliverDonations).toHaveBeenCalledWith([
      donation("1"),
      donation("2"),
    ]);
    expect(env.PIXELS_QUEUE.sendBatch).toHaveBeenCalledWith([
      messages.messages[0],
    ]);
  });

  it("does not forward anything when every donation was cancelled", async () => {
    const { env, batch } = setup([]);

    await worker.queue!(
      batch("alveus-donations", ["1"]),
      env,
      {} as ExecutionContext,
    );
    expect(env.PIXELS_QUEUE.sendBatch).not.toHaveBeenCalled();
  });

  it("allocates pixels through the manager", async () => {
    const { manager, env, batch } = setup([]);

    await worker.queue!(
      batch("alveus-pixels", ["1"]),
      env,
      {} as ExecutionContext,
    );
    expect(manager.deliverPixels).toHaveBeenCalledWith([donation("1")]);
  });
});

import { describe, expect, it, vi } from "vitest";
import { parsePresetCommand, presetCommands } from "../src/presets/parser";
import {
  createPresetClient,
  type PresetTransport,
  type ChatPresetOperation,
} from "../src/presets/client";
import {
  presetOperationId,
  runPresetOperation,
} from "../src/presets/operation";
import {
  createPresetCommands,
  presetHandler,
} from "../src/bot/commands/presets";

vi.mock("@twurple/easy-bot", () => ({
  createBotCommand: (name: string, execute: unknown) => ({ name, execute }),
}));
const input = {
  command: {
    id: "55883f53-59c9-4ed9-97f6-bcb2ca561e62",
    action: "load" as const,
    camera: "garden",
    name: "home",
  },
  actor: { twitchUserId: "123", name: "Viewer" },
};
const completed: ChatPresetOperation = {
  id: input.command.id,
  action: "load",
  camera: "garden",
  name: "home",
  newName: undefined,
  actor: { id: "twitch:123", name: "Viewer" },
  createdAt: "2026-10-16T00:00:00.000Z",
  expiresAt: "2026-10-16T00:00:15.000Z",
  preset: null,
  position: null,
  result: null,
  status: "completed" as const,
  error: null,
};
function transport() {
  return {
    command: vi.fn().mockResolvedValue(completed),
    operation: vi.fn().mockResolvedValue(completed),
    catalog: vi.fn().mockResolvedValue([]),
  } as unknown as PresetTransport;
}
function context(id = "event-1") {
  return {
    userId: "123",
    userDisplayName: "RealViewer",
    broadcasterId: "456",
    msg: { id },
    reply: vi.fn().mockResolvedValue(undefined),
  };
}
function clock() {
  let time = 1000;
  return {
    now: () => time,
    wait: async (ms: number) => {
      time += ms;
    },
    timeout: 50,
    pollInterval: 5,
  };
}

describe("explicit-camera parsing", () => {
  it.each([
    [
      "ptzload",
      ["garden", "home"],
      { action: "load", camera: "garden", name: "home" },
    ],
    ["ptzhome", ["garden"], { action: "load", camera: "garden", name: "home" }],
    [
      "ptzsave",
      ["crowin", '"feeding', 'spot"'],
      { action: "save", camera: "crowin", name: "feeding spot" },
    ],
    [
      "ptzrename",
      ["garden", '"old', 'name"', '"new', 'name"'],
      {
        action: "rename",
        camera: "garden",
        name: "old name",
        newName: "new name",
      },
    ],
    [
      "ptzremove",
      ["garden", "home"],
      { action: "remove", camera: "garden", name: "home" },
    ],
    ["ptzclear", ["garden", "confirm"], { action: "clear", camera: "garden" }],
    ["ptzlist", ["garden"], { action: "list", camera: "garden" }],
  ] as const)("parses %s", (command, args, expected) =>
    expect(parsePresetCommand(command, args)).toEqual(expected),
  );
  it.each([
    ["ptzload", []],
    ["ptzload", ["home"]],
    ["ptzload", ["garden", "home", "all"]],
    ["ptzhome", []],
    ["ptzhome", ["all"]],
    ["ptzclear", ["garden"]],
    ["ptzclear", ["garden", "yes"]],
    ["ptzrename", ["garden", "old", "new", "extra"]],
    ["ptzsave", ["garden", '"unclosed']],
    ["ptzsave", ["garden", '""']],
  ] as const)("rejects invalid %s arguments", (command, args) =>
    expect(() => parsePresetCommand(command, args)).toThrow("Usage:"),
  );
});

describe("registration and authentic actors", () => {
  it("registers nothing without an enabled credential file", () =>
    expect(createPresetCommands({ apiBaseUrl: "not-a-url" })).toEqual([]));
  it("registers only the seven explicit preset commands", () =>
    expect(
      createPresetCommands({
        apiBaseUrl: "http://127.0.0.1/api/",
        keyFile: "mock",
        transport: transport(),
      }).map((command) => command.name),
    ).toEqual([...presetCommands]));
  it("uses authentic context user ID and forwards no badge/moderator claims", async () => {
    const api = transport(),
      run = vi.fn().mockResolvedValue("completed"),
      ctx = context();
    await presetHandler(api, { run })(
      "ptzsave",
      ["garden", "pretend-admin"],
      ctx,
    );
    expect(run.mock.calls[0]![0].actor).toEqual({
      twitchUserId: "123",
      name: "RealViewer",
    });
    expect(Object.keys(run.mock.calls[0]![0])).toEqual(["command", "actor"]);
  });
  it("cannot derive identity from a name or command argument", async () => {
    const run = vi.fn(),
      ctx = { ...context(), userId: "" };
    await presetHandler(transport(), { run })(
      "ptzload",
      ["garden", "123"],
      ctx,
    );
    expect(run).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Cannot identify"),
    );
  });
  it("deduplicates message redelivery and derives the same UUID after handler recreation", async () => {
    const run = vi.fn().mockResolvedValue("completed"),
      api = transport(),
      handle = presetHandler(api, { run });
    await Promise.all([
      handle("ptzload", ["garden", "home"], context()),
      handle("ptzload", ["garden", "home"], context()),
    ]);
    expect(run).toHaveBeenCalledTimes(1);
    await presetHandler(api, { run })("ptzload", ["garden", "home"], context());
    expect(run.mock.calls[1]![0].command.id).toBe(
      run.mock.calls[0]![0].command.id,
    );
    expect(
      presetOperationId({
        messageId: "event-1",
        broadcasterId: "456",
        userId: "123",
      }),
    ).not.toBe(
      presetOperationId({
        messageId: "event-1",
        broadcasterId: "456",
        userId: "999",
      }),
    );
  });
});

describe("bounded same-ID recovery", () => {
  it("retries a lost response with one UUID and polls until actual completion", async () => {
    const api = transport();
    vi.mocked(api.command)
      .mockRejectedValueOnce(new Error("lost"))
      .mockResolvedValueOnce({ ...completed, status: "pending" });
    const result = await runPresetOperation(input, api, clock());
    expect(result).toContain("completed");
    expect(
      vi.mocked(api.command).mock.calls.map(([value]) => value.command.id),
    ).toEqual([input.command.id, input.command.id]);
    expect(api.operation).toHaveBeenCalledWith(
      { id: input.command.id, actor: { twitchUserId: "123" } },
      expect.any(AbortSignal),
    );
  });
  it("never announces success for persistent pending state", async () => {
    const api = transport();
    vi.mocked(api.command).mockResolvedValue({
      ...completed,
      status: "pending",
    });
    vi.mocked(api.operation).mockResolvedValue({
      ...completed,
      status: "pending",
    });
    expect(await runPresetOperation(input, api, clock())).toContain(
      "completion unknown",
    );
    expect(api.command).toHaveBeenCalledTimes(1);
  });
  it("reports permission refusals without echoing secrets or remote URL text", async () => {
    const api = transport();
    vi.mocked(api.command).mockRejectedValue({
      data: { code: "FORBIDDEN" },
      message: "https://private.invalid/key=secret",
    });
    const text = await runPresetOperation(input, api, clock());
    expect(text).toContain("access was refused");
    expect(text).not.toContain("private");
    expect(text).not.toContain("secret");
    expect(api.operation).not.toHaveBeenCalled();
  });
  it("retains unknown execution after a lost response followed by an auth refusal", async () => {
    const api = transport();
    vi.mocked(api.command)
      .mockRejectedValueOnce(new Error("lost"))
      .mockRejectedValue({ data: { code: "UNAUTHORIZED" } });
    vi.mocked(api.operation).mockRejectedValue({
      data: { code: "UNAUTHORIZED" },
    });
    expect(await runPresetOperation(input, api, clock())).toContain(
      "completion unknown",
    );
    expect(
      vi.mocked(api.command).mock.calls.map(([value]) => value.command.id),
    ).toEqual([input.command.id, input.command.id]);
  });
  it("bounds a stalled request and aborts without claiming a camera outcome", async () => {
    const api = transport();
    let signal: AbortSignal | undefined;
    vi.mocked(api.command).mockImplementation((_input, value) => {
      signal = value;
      return new Promise(() => {});
    });
    const result = await runPresetOperation(input, api, {
      timeout: 20,
      pollInterval: 1,
    });
    expect(result).toContain("completion unknown");
    expect(signal?.aborted).toBe(true);
  });
});

describe("typed tRPC boundary", () => {
  it("uses API_BASE_URL/trpc, reads the key per request, and forbids redirects", async () => {
    const readKey = vi.fn().mockResolvedValue("mock-key\n");
    const request = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ result: { data: { json: [] } } }), {
          headers: { "content-type": "application/json" },
        }),
    );
    const api = createPresetClient({
      apiBaseUrl: "http://127.0.0.1:3000/api/",
      keyFile: "unused",
      readKey,
      fetch: request,
    });
    await api.catalog("garden");
    await api.catalog("crowin");
    expect(readKey).toHaveBeenCalledTimes(2);
    const [url, options] = request.mock.calls[0]!;
    expect(String(url)).toContain(
      "http://127.0.0.1:3000/api/trpc/presets.catalog",
    );
    expect(new Headers(options.headers).get("authorization")).toBe(
      "ApiKey mock-key",
    );
    expect(options.redirect).toBe("error");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it("serializes the typed chat command and recovers using an actor-ID-only query", async () => {
    const request = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({ result: { data: { json: completed } } }),
            { headers: { "content-type": "application/json" } },
          ),
      );
    const api = createPresetClient({
      apiBaseUrl: "https://website.example/api/",
      keyFile: "unused",
      readKey: async () => "mock-key",
      fetch: request,
    });
    await api.command(input);
    await api.operation({
      id: input.command.id,
      actor: { twitchUserId: input.actor.twitchUserId },
    });
    expect(String(request.mock.calls[0]![0])).toContain(
      "/api/trpc/presets.chatCommand",
    );
    expect(JSON.parse(request.mock.calls[0]![1].body).json).toEqual(input);
    const query = new URL(request.mock.calls[1]![0]);
    expect(JSON.parse(query.searchParams.get("input")!).json).toEqual({
      id: input.command.id,
      actor: { twitchUserId: "123" },
    });
  });
  it.each([
    "http://rack.invalid/api/",
    "https://user:password@example.com/api/",
    "https://example.com/api/?key=secret",
  ])("rejects unsafe configuration without exposing %s", (base) =>
    expect(() =>
      createPresetClient({ apiBaseUrl: base, keyFile: "unused" }),
    ).toThrow("configuration is invalid"),
  );
});

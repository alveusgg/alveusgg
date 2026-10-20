// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { commandForRetry, operationFailure } from "@/utils/preset-operation";

import usePresetAccess from "@/hooks/preset-access";
import usePresetOperation from "@/hooks/preset-operation";

import OperationStatus from "@/components/presets/OperationStatus";

const mock = vi.hoisted(() => {
  const mutateAsync = vi.fn(),
    fetch = vi.fn(),
    invalidate = vi.fn(),
    accessInvalidate = vi.fn(),
    accessCancel = vi.fn().mockResolvedValue(undefined);
  return {
    userId: "test-user",
    accessInvalidate,
    accessCancel,
    mutateAsync,
    fetch,
    invalidate,
    utils: {
      presets: {
        userOperation: { fetch },
        catalog: { invalidate },
        access: { invalidate: accessInvalidate, cancel: accessCancel },
      },
    },
  };
});
vi.mock("@/utils/trpc", () => ({
  trpc: {
    useUtils: () => mock.utils,
    presets: {
      access: { useQuery: () => ({ data: { canLoad: true } }) },
      userCommand: { useMutation: () => ({ mutateAsync: mock.mutateAsync }) },
    },
  },
}));
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: mock.userId } } }),
}));
function Harness({ action = "save" }: { action?: "save" | "load" }) {
  const operation = usePresetOperation("test-preset-operation");
  return (
    <>
      <button
        disabled={operation.busy}
        onClick={() =>
          operation.run({ action, camera: "garden", name: "home" })
        }
      >
        {action === "load" ? "Load" : "Save"}
      </button>
      <OperationStatus operation={operation} />
    </>
  );
}

let container: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.clearAllMocks();
  mock.userId = "test-user";
  sessionStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  sessionStorage.clear();
  vi.useRealTimers();
});

describe("website preset operations", () => {
  it("retains an unknown request across remount and retries the exact UUID/payload", async () => {
    mock.mutateAsync
      .mockRejectedValueOnce(new Error("network failed"))
      .mockImplementation(async (command) => ({
        id: command.id,
        status: "completed",
        error: null,
      }));
    await act(async () => root.render(<Harness />));
    await act(async () => container.querySelector("button")!.click());
    expect(container.textContent).toContain("Completion unknown");
    const original = mock.mutateAsync.mock.calls[0]![0];
    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<Harness />));
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Retry original request",
    )!;
    await act(async () => retry.click());
    expect(mock.mutateAsync.mock.calls[1]![0]).toEqual(original);
    expect(container.textContent).toContain("Operation completed");
    expect(mock.invalidate).toHaveBeenCalled();
    expect(sessionStorage.length).toBe(0);
  });
  it("shows a definitive server rejection as failed and enables a new deliberate action", async () => {
    mock.mutateAsync.mockRejectedValue(
      Object.assign(new Error("Subscriber preset loading is paused"), {
        data: { code: "FORBIDDEN" },
      }),
    );
    await act(async () => root.render(<Harness />));
    await act(async () => container.querySelector("button")!.click());
    expect(container.textContent).toContain("Operation failed");
    expect(container.textContent).toContain(
      "Subscriber preset loading is paused",
    );
    expect(container.querySelector("button")!.disabled).toBe(false);
    expect(container.textContent).not.toContain("Retry original request");
  });
  it("polls a pending operation and displays its actual failure", async () => {
    vi.useFakeTimers();
    mock.mutateAsync.mockImplementation(async (command) => ({
      id: command.id,
      status: "pending",
      error: null,
    }));
    mock.fetch.mockImplementation(async ({ id }) => ({
      id,
      status: "failed",
      error: "Camera changed during capture",
    }));
    await act(async () => root.render(<Harness />));
    await act(async () => container.querySelector("button")!.click());
    expect(container.textContent).toContain("Operation pending");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(750);
    });
    expect(container.textContent).toContain("Operation failed");
    expect(container.textContent).toContain("Camera changed during capture");
    expect(mock.fetch).toHaveBeenCalledWith({
      id: mock.mutateAsync.mock.calls[0]![0].id,
    });
  });
  it.each(["response", "poll"])(
    "retains a Worker-reported unknown load from the %s until acknowledged",
    async (source) => {
      vi.useFakeTimers();
      const message =
        "Load outcome unknown; it will not be automatically repeated.";
      mock.mutateAsync.mockImplementation(async (command) => ({
        id: command.id,
        status: source === "response" ? "unknown" : "pending",
        error: source === "response" ? message : null,
      }));
      mock.fetch.mockImplementation(async ({ id }) => ({
        id,
        status: "unknown",
        error: message,
      }));
      await act(async () => root.render(<Harness action="load" />));
      await act(async () => container.querySelector("button")!.click());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(750);
      });
      const original = mock.mutateAsync.mock.calls[0]![0];
      expect(container.textContent).toContain("Completion unknown");
      expect(container.textContent).not.toContain("Operation failed");
      expect(container.textContent).not.toContain("Retry original request");
      expect(container.querySelector("button")!.disabled).toBe(true);
      expect(
        JSON.parse(sessionStorage.getItem("test-preset-operation:test-user")!),
      ).toEqual(original);
      const polls = mock.fetch.mock.calls.length;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });
      expect(mock.fetch).toHaveBeenCalledTimes(polls);
      expect(mock.mutateAsync).toHaveBeenCalledOnce();

      mock.userId = "another-user";
      await act(async () => root.render(<Harness action="load" />));
      expect(container.textContent).not.toContain("Completion unknown");
      mock.userId = "test-user";
      await act(async () => root.render(<Harness action="load" />));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(750);
      });
      expect(container.textContent).toContain("Acknowledge unknown outcome");

      await act(async () => root.unmount());
      root = createRoot(container);
      await act(async () => root.render(<Harness action="load" />));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(750);
      });
      expect(mock.fetch).toHaveBeenLastCalledWith({ id: original.id });
      expect(container.querySelector("button")!.disabled).toBe(true);
      expect(sessionStorage.length).toBe(1);
      const acknowledge = [...container.querySelectorAll("button")].find(
        (button) => button.textContent === "Acknowledge unknown outcome",
      )!;
      await act(async () => acknowledge.click());
      expect(sessionStorage.length).toBe(0);
      expect(container.querySelector("button")!.disabled).toBe(false);
      expect(mock.mutateAsync).toHaveBeenCalledOnce();
      await act(async () => container.querySelector("button")!.click());
      expect(mock.mutateAsync.mock.calls[1]![0].id).not.toBe(original.id);
    },
  );
  it.each(["UNAUTHORIZED", "FORBIDDEN", "TOO_MANY_REQUESTS"])(
    "keeps the original UUID unknown after %s on recovery",
    async (code) => {
      mock.mutateAsync
        .mockRejectedValueOnce(new Error("network"))
        .mockRejectedValueOnce(
          Object.assign(new Error("Log in again"), {
            data: { code },
          }),
        );
      await act(async () => root.render(<Harness />));
      await act(async () => container.querySelector("button")!.click());
      const original = mock.mutateAsync.mock.calls[0]![0];
      const retry = [...container.querySelectorAll("button")].find(
        (button) => button.textContent === "Retry original request",
      )!;
      await act(async () => retry.click());
      expect(container.textContent).toContain("Completion unknown");
      expect(container.querySelector("button")!.disabled).toBe(true);
      expect(mock.mutateAsync.mock.calls[1]![0]).toEqual(original);
      expect(
        JSON.parse(sessionStorage.getItem("test-preset-operation:test-user")!),
      ).toEqual(original);
    },
  );
  it("isolates account changes and ignores an old account's late mutation response", async () => {
    let finish!: (value: unknown) => void;
    mock.mutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await act(async () => root.render(<Harness />));
    await act(async () => container.querySelector("button")!.click());
    const original = mock.mutateAsync.mock.calls[0]![0];
    mock.userId = "another-user";
    await act(async () => root.render(<Harness />));
    await act(async () =>
      finish({ id: original.id, status: "completed", error: null }),
    );
    expect(container.textContent).not.toContain("Operation completed");
    expect(
      JSON.parse(sessionStorage.getItem("test-preset-operation:test-user")!),
    ).toEqual(original);
    expect(
      sessionStorage.getItem("test-preset-operation:another-user"),
    ).toBeNull();
  });
  it.each(["completed", "unknown"])(
    "does not replace a terminal %s poll result with a late network error",
    async (status) => {
      vi.useFakeTimers();
      let fail!: (error: Error) => void;
      mock.mutateAsync.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            fail = reject;
          }),
      );
      mock.fetch.mockImplementation(async ({ id }) => ({
        id,
        status,
        error: null,
      }));
      await act(async () => root.render(<Harness />));
      await act(async () => container.querySelector("button")!.click());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(750);
      });
      const message =
        status === "completed" ? "Operation completed" : "Completion unknown";
      expect(container.textContent).toContain(message);
      await act(async () => fail(new Error("lost response")));
      expect(container.textContent).toContain(message);
      expect(sessionStorage.length).toBe(status === "completed" ? 0 : 1);
    },
  );
  it("cancels and refreshes cached access when the signed-in identity changes", async () => {
    function AccessHarness() {
      usePresetAccess();
      return null;
    }
    await act(async () => root.render(<AccessHarness />));
    expect(mock.accessInvalidate).not.toHaveBeenCalled();
    mock.userId = "new-user";
    await act(async () => root.render(<AccessHarness />));
    expect(mock.accessCancel).toHaveBeenCalledOnce();
    expect(mock.accessInvalidate).toHaveBeenCalledOnce();
  });
  it("does not turn ambiguous network errors into execution failures", () => {
    expect(operationFailure(new Error("network"))).toMatchObject({
      definitive: false,
    });
    const command = {
      id: crypto.randomUUID(),
      action: "rename" as const,
      camera: "garden",
      name: "old",
      newName: "new",
    };
    expect(commandForRetry({ command, status: "unknown" })).toBe(command);
    expect(
      commandForRetry({ command, status: "unknown", terminal: true }),
    ).toBeUndefined();
    expect(commandForRetry({ command, status: "completed" })).toBeUndefined();
  });
});

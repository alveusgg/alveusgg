// @vitest-environment jsdom
import type { Session } from "next-auth";
import { act, createElement } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { scopeGroups } from "@/data/twitch";

import TwitchScopeChecker from "@/components/shared/TwitchScopeChecker";

const { signIn, useSession } = vi.hoisted(() => ({
  signIn: vi.fn(),
  useSession: vi.fn(),
}));
vi.mock("next-auth/react", () => ({ signIn, useSession }));

let root: Root;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  root = createRoot(document.createElement("div"));
  window.history.replaceState(null, "", "/admin/twitch?channel=alveus#auth");
});
afterEach(async () => {
  await act(() => root.unmount());
  vi.unstubAllGlobals();
});

async function render(twitch?: NonNullable<Session["user"]>["twitch"]) {
  useSession.mockReturnValue({
    data: {
      user: { id: "alveus-user", roles: [], isSuperUser: false, twitch },
      expires: "2090-01-01T00:00:00.000Z",
    },
  });
  await act(() => root.render(createElement(TwitchScopeChecker)));
}

test("restores missing channel permissions while preserving existing scopes and the return URL", async () => {
  await render({
    id: "twitch-user",
    scopes: [...scopeGroups.default, "custom:read"],
    requiredScopes: [...scopeGroups.api],
  });

  expect(signIn).toHaveBeenCalledExactlyOnceWith(
    "twitch",
    { callbackUrl: window.location.href },
    { scope: expect.any(String) },
  );
  const scopes = signIn.mock.calls[0]![2].scope.split(" ");
  expect(scopes).toEqual(
    expect.arrayContaining([
      ...scopeGroups.default,
      ...scopeGroups.api,
      "custom:read",
    ]),
  );

  await render({
    id: "twitch-user",
    scopes,
    requiredScopes: [],
  });
  expect(signIn).toHaveBeenCalledTimes(1);
});

test.each([
  undefined,
  { id: "twitch-user", scopes: [...scopeGroups.default] },
  {
    id: "twitch-user",
    scopes: [...scopeGroups.default, ...scopeGroups.api],
    requiredScopes: [],
  },
])(
  "leaves sessions without missing channel permissions alone (%j)",
  async (twitch) => {
    await render(twitch);
    expect(signIn).not.toHaveBeenCalled();
  },
);

test.each(["expired", "unavailable"] as const)(
  "does not redirect for a Twitch authorization error (%s)",
  async (error) => {
    await render({
      id: "twitch-user",
      scopes: [],
      requiredScopes: [...scopeGroups.api],
      error,
    });
    expect(signIn).not.toHaveBeenCalled();
  },
);

test("does not redirect an unauthenticated visitor", async () => {
  useSession.mockReturnValue({ data: null });
  await act(() => root.render(createElement(TwitchScopeChecker)));
  expect(signIn).not.toHaveBeenCalled();
});

import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { forwardWithoutRoutePrefix } from "./url";

// Runs a request through a `/direct/*` route and captures what it would
// forward to the controller.
const forward = async (path: string, init?: RequestInit) => {
  let forwarded: Request | undefined;
  const app = new Hono().all("/direct/*", (c) => {
    forwarded = forwardWithoutRoutePrefix(c);
    return c.body(null, 204);
  });
  const response = await app.request(`https://cams.test${path}`, init);
  return { response, forwarded };
};

describe("forwardWithoutRoutePrefix", () => {
  it("strips the route prefix and keeps the query", async () => {
    const { forwarded } = await forward("/direct/info/position?unit=deg");

    expect(forwarded?.url).toBe("https://cams.test/info/position?unit=deg");
  });

  it("forwards the bare prefix as the root path", async () => {
    const { forwarded } = await forward("/direct");

    expect(forwarded?.url).toBe("https://cams.test/");
  });

  it("keeps the original percent-encoding", async () => {
    const { forwarded } = await forward("/direct/config/specs/a%5Cb");

    expect(forwarded?.url).toBe("https://cams.test/config/specs/a%5Cb");
  });

  it("rejects a percent-encoded prefix", async () => {
    const { response, forwarded } = await forward("/%64irect/info/position");

    expect(response.status).toBe(404);
    expect(forwarded).toBeUndefined();
  });

  it("forwards the method, body and only the headers the control API reads", async () => {
    const { forwarded } = await forward("/direct/ptz/move", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer user-token",
        "Content-Type": "application/json",
        Cookie: "session=secret",
        "CF-Connecting-IP": "203.0.113.7",
        "X-Camera-Name": "garden",
        "X-Forwarded-For": "203.0.113.7",
      },
      body: JSON.stringify({ direction: "up" }),
    });

    expect(forwarded?.method).toBe("POST");
    expect(Object.fromEntries(forwarded!.headers)).toEqual({
      accept: "application/json",
      "content-type": "application/json",
      "x-camera-name": "garden",
    });
    await expect(forwarded!.json()).resolves.toEqual({ direction: "up" });
  });
});

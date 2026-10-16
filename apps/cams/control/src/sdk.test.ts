import { describe, expect, it, vi } from "vitest";

import {
  getInfoPosition,
  setPtzLoad,
  setPtzMove,
  setPtzRptz,
} from "./generated";
import { createClient, createConfig } from "./generated/client";

const baseUrl = "https://cams.test/direct";
const headers = { "x-camera-name": "garden" };

// Shape of a real GET /info/position response (from the control-api mock).
const position = {
  pan: 10,
  tilt: 0,
  zoom: 4000,
  focus: 5000,
  autofocus: "on",
  fov: {
    hFOV: 5.62,
    vFOV: 3.16,
    focalLength: 72,
    x: -2.81,
    y: 1.58,
    multiplier: 10.4,
  },
};

// A client whose fetch records each request and answers with `respond`.
const setup = (respond: () => Response) => {
  const requests: Request[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(new Request(input, init));
    return respond();
  });
  const client = createClient(
    createConfig({
      baseUrl,
      fetch,
      headers: { Authorization: "Bearer test-token" },
    }),
  );
  return { client, requests };
};

describe("generated SDK", () => {
  it("sends a GET with the camera header and returns the parsed body", async () => {
    const { client, requests } = setup(() => Response.json(position));

    const result = await getInfoPosition({ client, headers });

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(position);

    expect(requests).toHaveLength(1);
    const [request] = requests;
    expect(request!.method).toBe("GET");
    expect(request!.url).toBe(`${baseUrl}/info/position`);
    expect(request!.headers.get("x-camera-name")).toBe("garden");
    expect(request!.headers.get("authorization")).toBe("Bearer test-token");
  });

  it("sends a mutation with its JSON body", async () => {
    const { client, requests } = setup(
      () => new Response("OK", { headers: { "Content-Type": "text/plain" } }),
    );

    const result = await setPtzMove({
      client,
      headers,
      body: { direction: "up" },
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toBe("OK");

    expect(requests).toHaveLength(1);
    const [request] = requests;
    expect(request!.method).toBe("POST");
    expect(request!.url).toBe(`${baseUrl}/ptz/move`);
    expect(request!.headers.get("x-camera-name")).toBe("garden");
    expect(request!.headers.get("content-type")).toBe("application/json");
    expect(await request!.json()).toEqual({ direction: "up" });
  });

  it("requires a body for every mutation", () => {
    const { client } = setup(() => new Response("OK"));

    // Only checked by `tsc`; the calls themselves are never awaited.
    // @ts-expect-error `body` is required for setPtzMove.
    void setPtzMove({ client, headers }).catch(() => {});
    // All of these fields are optional, but the control API requires one.
    // @ts-expect-error `body` is required for setPtzLoad.
    void setPtzLoad({ client, headers }).catch(() => {});
    // @ts-expect-error `body` is required for setPtzRptz.
    void setPtzRptz({ client, headers }).catch(() => {});
  });

  it("rejects a response that does not match the schema", async () => {
    const { client } = setup(() => Response.json({ pan: true }));

    await expect(
      getInfoPosition({ client, headers, throwOnError: true }),
    ).rejects.toThrow();
  });
});

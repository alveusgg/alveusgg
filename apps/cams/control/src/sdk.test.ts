import { describe, expect, it, vi } from "vitest";

import { getInfoPosition, setPtzMove } from "./generated";
import { createClient, createConfig } from "./generated/client";

const baseUrl = "https://cams.test/direct";
const headers = { "x-camera-name": "garden" };

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
    const { client, requests } = setup(() =>
      Response.json({ pan: 10.5, tilt: -3, zoom: 1 }),
    );

    const result = await getInfoPosition({ client, headers });

    expect(result.error).toBeUndefined();
    expect(result.data).toEqual({ pan: 10.5, tilt: -3, zoom: 1 });

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

  it("requires a body for mutations whose schema has required fields", () => {
    const { client } = setup(() => new Response("OK"));

    // Only checked by `tsc`; the call itself is never awaited.
    // @ts-expect-error `body` is required for setPtzMove.
    void setPtzMove({ client, headers }).catch(() => {});
  });

  it("rejects a response that does not match the schema", async () => {
    const { client } = setup(() => Response.json({ pan: true }));

    await expect(
      getInfoPosition({ client, headers, throwOnError: true }),
    ).rejects.toThrow();
  });
});

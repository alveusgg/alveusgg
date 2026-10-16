import { expect, it } from "vitest";
import {
  getInfoPosition,
  setPtzLoad,
  setPtzZoom,
} from "@alveusgg/cams-control-client";
import {
  createClient,
  createConfig,
} from "@alveusgg/cams-control-client/client";

const base = "http://127.0.0.1:8787";
const headers = { "x-camera-name": "garden" };

async function token(roles: string) {
  const response = await fetch(`http://127.0.0.1:8798/mint?roles=${roles}`);
  expect(response.status).toBe(200);
  return (await response.json()).accessToken as string;
}

function client(accessToken: string) {
  return createClient(
    createConfig({
      baseUrl: `${base}/direct`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  );
}

async function waitFor(check: () => boolean) {
  const until = Date.now() + 5000;
  while (!check()) {
    if (Date.now() > until)
      throw new Error("Timed out waiting for a mock event.");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

it("uses the SDK and local event service binding against mock cameras only", async () => {
  // Never accept a configurable URL. Check the dev-only entry point AND the
  // infrastructure camera before sending any mutation.
  expect(await fetch(`${base}/__mock/health`).then((r) => r.json())).toEqual({
    mode: "local-mock",
    rest: 1229,
    events: 3130,
  });
  const state = await fetch("http://127.0.0.1:8090/mock/state").then((r) =>
    r.json(),
  );
  expect(state["garden.cam"].position).toBeDefined();

  const unauthenticated = new WebSocket(
    "ws://127.0.0.1:8787/__mock/events?authenticated=false",
  );
  try {
    const code = await new Promise<number>((resolve, reject) => {
      unauthenticated.addEventListener("close", (event) => resolve(event.code));
      unauthenticated.addEventListener("error", () =>
        reject(new Error("Mock event upgrade failed.")),
      );
    });
    expect(code).toBe(4401);
  } finally {
    unauthenticated.close();
  }

  const events: {
    camera: string;
    event: string;
    data: { is_moving: boolean };
  }[] = [];
  let connected = false;
  const socket = new WebSocket("ws://127.0.0.1:8787/__mock/events");
  socket.addEventListener("message", (message) => {
    if (message.data === "Successfully connected to websocket")
      connected = true;
    else {
      try {
        events.push(JSON.parse(String(message.data)));
      } catch {
        /* Ignore non-JSON frames. */
      }
    }
  });
  try {
    await waitFor(() => connected);
    const authorized = client(await token("ptzControl"));
    const initial = await getInfoPosition({
      client: authorized,
      headers,
      throwOnError: true,
    });
    expect(typeof initial.data.pan).toBe("number");

    await setPtzLoad({
      client: authorized,
      headers,
      body: { pan: 45, tilt: -10, zoom: 2000 },
      throwOnError: true,
    });
    await waitFor(() =>
      events.some(
        (e) =>
          e.camera === "garden" &&
          e.event === "ptz" &&
          e.data.is_moving === false,
      ),
    );
    expect(
      events.some(
        (e) =>
          e.camera === "garden" &&
          e.event === "ptz" &&
          e.data.is_moving === true,
      ),
    ).toBe(true);
    const moved = await getInfoPosition({
      client: authorized,
      headers,
      throwOnError: true,
    });
    expect(moved.data.pan).toBe(45);
    expect(moved.data.tilt).toBe(-10);

    await setPtzZoom({
      client: authorized,
      headers,
      body: { value: 2500 },
      throwOnError: true,
    });
    const zoomed = await getInfoPosition({
      client: authorized,
      headers,
      throwOnError: true,
    });
    expect(zoomed.data.zoom).toBe(2500);
    const mockState = await fetch("http://127.0.0.1:8090/mock/state").then(
      (r) => r.json(),
    );
    expect(mockState["garden.cam"].position.zoom).toBe(2500);

    const denied = await getInfoPosition({
      client: client(await token("")),
      headers,
    });
    expect(denied.response.status).toBe(403);
    const unknown = await getInfoPosition({
      client: authorized,
      headers: { "x-camera-name": "not-a-camera" },
    });
    expect(unknown.response.status).toBe(400);
  } finally {
    socket.close();
  }
});

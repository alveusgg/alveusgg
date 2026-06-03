import type { NextApiRequest, NextApiResponse } from "next";

import { describe, expect, it, vi } from "vitest";

// Control the secret the endpoint checks against.
vi.mock("@/env", () => ({ env: { OLON_REVALIDATE_SECRET: "test-secret" } }));

import handler from "@/pages/api/revalidate";

type MockRes = NextApiResponse & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
  revalidate: ReturnType<typeof vi.fn>;
};

function makeRes(): MockRes {
  const res = {} as MockRes;
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.setHeader = vi.fn(() => res);
  res.revalidate = vi.fn(async () => {});
  return res;
}

function makeReq(over: Partial<NextApiRequest> = {}): NextApiRequest {
  return {
    method: "POST",
    headers: { authorization: "Bearer test-secret" },
    body: { path: "/ambassadors" },
    ...over,
  } as NextApiRequest;
}

describe("/api/revalidate", () => {
  it("405s non-POST methods", async () => {
    const res = makeRes();
    await handler(makeReq({ method: "GET" }), res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("401s when the auth header is missing", async () => {
    const res = makeRes();
    await handler(makeReq({ headers: {} }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("401s on a wrong secret", async () => {
    const res = makeRes();
    await handler(makeReq({ headers: { authorization: "Bearer nope" } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("400s on a missing path", async () => {
    const res = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("400s on a non-relative (URL) path", async () => {
    const res = makeRes();
    await handler(makeReq({ body: { path: "https://evil.example/x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("400s on a protocol-relative path", async () => {
    const res = makeRes();
    await handler(makeReq({ body: { path: "//evil.example/x" } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  it("200s and revalidates on a correct secret + valid path", async () => {
    const res = makeRes();
    await handler(makeReq({ body: { path: "/ambassadors" } }), res);
    expect(res.revalidate).toHaveBeenCalledWith("/ambassadors");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("revalidates every path when given `paths`", async () => {
    const res = makeRes();
    await handler(makeReq({ body: { paths: ["/", "/ambassadors/noodle"] } }), res);
    expect(res.revalidate).toHaveBeenCalledWith("/");
    expect(res.revalidate).toHaveBeenCalledWith("/ambassadors/noodle");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

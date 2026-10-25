import { type inferRouterError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { expect, it, vi } from "vitest";
import { z } from "zod";

import type { Context } from "@/server/trpc/context";
import { publicProcedure, router } from "@/server/trpc/trpc";

import { getProcedureErrorMessages } from "@/utils/trpc-errors";

vi.mock("@/env", () => {
  return {
    env: {},
  };
});

const schema = z.object({
  title: z.string().min(1, "Please enter a title"),
  startAt: z.date(),
  links: z.array(z.url()),
  address: z.object({ addressLine1: z.string().min(1, "Required") }).optional(),
});

const getError = (input: unknown) => {
  const result = schema.safeParse(input);
  if (result.success) throw new Error("Expected input to be invalid");
  return {
    message: result.error.message,
    data: { zodIssues: result.error.issues },
  };
};

it("prefixes each issue with its field", () => {
  expect(
    getProcedureErrorMessages(
      getError({ title: "", startAt: new Date(), links: [] }),
    ),
  ).toEqual(["Title: Please enter a title"]);
  expect(
    getProcedureErrorMessages(getError({ title: "Hi", links: [] })),
  ).toEqual([expect.stringMatching(/^Start at: /)]);
});

it("uses the last named key of nested fields", () => {
  expect(
    getProcedureErrorMessages(
      getError({
        title: "Hi",
        startAt: new Date(),
        links: [],
        address: { addressLine1: "" },
      }),
    ),
  ).toEqual(["Address line 1: Required"]);
});

it("drops duplicate display messages without changing the original issues", () => {
  const error = getError({ title: "", startAt: new Date(), links: ["a", "b"] });
  const original = structuredClone(error);

  expect(getProcedureErrorMessages(error)).toEqual([
    "Title: Please enter a title",
    "Links: Invalid URL",
  ]);
  expect(error).toEqual(original);
  expect(error.data.zodIssues.map(({ path }) => path)).toEqual([
    ["title"],
    ["links", 0],
    ["links", 1],
  ]);
});

it("keeps issues without a field as they are", () => {
  expect(getProcedureErrorMessages(getError("not an object"))).toEqual([
    "Invalid input: expected object, received string",
  ]);
});

it("keeps the original message when there are no validation issues", () => {
  const message = "Something broke\nPlease try again";
  for (const data of [
    undefined,
    null,
    {},
    { zodIssues: null },
    { zodIssues: [] },
  ]) {
    expect(getProcedureErrorMessages({ message, data })).toEqual([message]);
  }
});

it("preserves raw input errors over HTTP and supplies issues for client formatting", async () => {
  const testRouter = router({
    submit: publicProcedure.input(schema).query(() => "ok"),
    fail: publicProcedure.query(() => {
      throw new Error("Something broke");
    }),
  });

  const call = async (path: string, input: unknown) => {
    const res = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(
        `http://localhost/api/trpc/${path}?input=${encodeURIComponent(
          JSON.stringify({ json: input }),
        )}`,
      ),
      router: testRouter,
      createContext: () => ({}) as Context,
    });
    return (
      (await res.json()) as {
        error: { json: inferRouterError<typeof testRouter> };
      }
    ).error.json;
  };

  const input = { title: "", links: ["a", "b"], address: { addressLine1: "" } };
  const expected = getError(input);
  const error = await call("submit", input);
  expect(error.message).toBe(expected.message);
  expect(error.data.zodIssues).toEqual(expected.data.zodIssues);
  expect(getProcedureErrorMessages(error)).toEqual([
    "Title: Please enter a title",
    expect.stringMatching(/^Start at: /),
    "Links: Invalid URL",
    "Address line 1: Required",
  ]);

  const failure = await call("fail", undefined);
  expect(failure.message).toBe("Something broke");
  expect(failure.data.zodIssues).toBeNull();
  expect(getProcedureErrorMessages(failure)).toEqual(["Something broke"]);
});

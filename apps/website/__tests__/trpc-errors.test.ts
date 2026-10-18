import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { expect, it, vi } from "vitest";
import { z } from "zod";

import { type Context } from "@/server/trpc/context";
import { publicProcedure, router } from "@/server/trpc/trpc";
import { formatZodError } from "@/server/utils/zod-error";

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
  return result.error;
};

it("prefixes each issue with its field", () => {
  expect(
    formatZodError(getError({ title: "", startAt: new Date(), links: [] })),
  ).toBe("Title: Please enter a title");
  expect(formatZodError(getError({ title: "Hi", links: [] }))).toMatch(
    /^Start at: /,
  );
});

it("uses the last named key of nested fields", () => {
  expect(
    formatZodError(
      getError({
        title: "Hi",
        startAt: new Date(),
        links: [],
        address: { addressLine1: "" },
      }),
    ),
  ).toBe("Address line 1: Required");
});

it("puts every issue on its own line and drops duplicates", () => {
  const message = formatZodError(
    getError({ title: "", startAt: new Date(), links: ["a", "b"] }),
  );

  expect(message.split("\n")).toEqual([
    "Title: Please enter a title",
    "Links: Invalid URL",
  ]);
});

it("keeps issues without a field as they are", () => {
  expect(formatZodError(getError("not an object"))).toBe(
    "Invalid input: expected object, received string",
  );
});

it("is used for input errors of tRPC procedures", async () => {
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
    return ((await res.json()) as { error: { json: { message: string } } })
      .error.json.message;
  };

  expect(await call("submit", { title: "", links: [] })).toBe(
    formatZodError(getError({ title: "", links: [] })),
  );
  expect(await call("fail", undefined)).toBe("Something broke");
});

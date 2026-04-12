import { createMiddleware } from "hono/factory";
import type { Variables } from "hono/types";
import { z } from "zod";
import { validateJWT } from "../utils/auth";

const Roles = z.enum(["ptzControl"]).or(z.string());
type Roles = z.infer<typeof Roles>;

export const TokenPayload = z.object({
  sub: z.string(),
  roles: z.array(Roles),
});

export const accountWithRoles = (...roles: Roles[]) =>
  createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const authorization =
      c.req.header("Authorization") ?? `Bearer ${c.req.query("authorization")}`;
    if (!authorization) {
      return c.json({ error: "You are not authenticated." }, 401);
    }
    const [type, token] = authorization.split(" ");
    if (type !== "Bearer" || !token) {
      return c.json(
        { error: "You are using an invalid authentication method." },
        401,
      );
    }
    try {
      await validateJWTForRoles(token, ...roles);
      await next();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 401);
      }
      return c.json({ error: "An unknown error occurred." }, 500);
    }
  });

export const validateJWTForRoles = async (token: string, ...roles: Roles[]) => {
  const decoded = await validateJWT(token);
  if (!decoded.subject) {
    throw new Error("Your token is malformed as it does not have a subject.");
  }
  const payload = TokenPayload.safeParse(decoded.payload);
  if (!payload.success) {
    throw new Error(`Your token is malformed: ${payload.error.message}`);
  }

  if (!payload.data.roles.some((role) => roles.includes(role))) {
    throw new Error("You are not authorized to access this resource.");
  }

  return true;
};

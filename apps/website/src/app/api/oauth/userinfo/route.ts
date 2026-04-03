import {
  OAuthRequestError,
  getOAuthUser,
  verifyAccessToken,
} from "@/server/oauth/tokens";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^bearer\s+/i.test(authorization)) {
    throw new OAuthRequestError(401, "invalid_token", "Missing bearer token.");
  }

  return authorization.replace(/^bearer\s+/i, "").trim();
}

function unauthorized(description: string) {
  return Response.json(
    {
      error: "invalid_token",
      error_description: description,
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer error="invalid_token", error_description="${description}"`,
      },
    },
  );
}

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request);
    const claims = await verifyAccessToken(token);
    const user = await getOAuthUser(claims.sub);

    if (!user) {
      return unauthorized("User is no longer available.");
    }

    return Response.json(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        email_verified: Boolean(user.emailVerified),
        picture: user.image,
        roles: user.roles,
        twitch_user_id: user.twitchUserId ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof OAuthRequestError) {
      return unauthorized(error.message);
    }

    console.error(error);
    return unauthorized("Unable to load user profile.");
  }
}

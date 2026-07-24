import { getOAuthPublicJwk, hasOAuthSigningKey } from "@/server/oauth/keys";

export async function GET() {
  if (!hasOAuthSigningKey()) {
    return Response.json(
      {
        error: "server_error",
        error_description: "OAuth signing key is not configured.",
      },
      { status: 503 },
    );
  }

  return Response.json({
    keys: [getOAuthPublicJwk()],
  });
}

import { createServer } from "node:http";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

export const issuer = "http://127.0.0.1:8798";

export async function startIssuer() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: "local-mock",
    alg: "RS256",
  };
  const server = createServer(async (request, response) => {
    // No request logging: /mint responses contain bearer credentials.
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", "application/json");
    if (request.method !== "GET" || request.headers.host !== "127.0.0.1:8798") {
      response.writeHead(400).end("{}");
      return;
    }
    const url = new URL(request.url, issuer);
    if (url.pathname === "/.well-known/oauth-authorization-server") {
      response.end(
        JSON.stringify({ issuer, jwks_uri: `${issuer}/.well-known/jwks.json` }),
      );
    } else if (url.pathname === "/.well-known/jwks.json") {
      response.end(JSON.stringify({ keys: [jwk] }));
    } else if (url.pathname === "/mint") {
      try {
        const roles = (url.searchParams.get("roles") ?? "ptzControl")
          .split(",")
          .filter(Boolean);
        const accessToken = await new SignJWT({ type: "access", roles })
          .setProtectedHeader({ alg: "RS256", kid: "local-mock" })
          .setSubject("local-developer")
          .setIssuer(issuer)
          .setIssuedAt()
          .setExpirationTime("10m")
          .sign(privateKey);
        response.end(JSON.stringify({ accessToken }));
      } catch {
        response.writeHead(500).end("{}");
      }
    } else {
      response.writeHead(404).end("{}");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(8798, "127.0.0.1", resolve);
  });
  return server;
}

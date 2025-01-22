export async function GET(request: Request) {
  const opt = request.method === "OPTIONS";
  return Response.json({ opt });
}

export const runtime = "edge";

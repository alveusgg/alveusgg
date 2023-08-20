import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import { env } from "@/env/index.mjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

/*
 * To enable uploads to DO Spaces in development, we need to proxy the request
 * through the Next.js server. This is because the DO Spaces endpoint is not
 * accessible without ssl, and Next.js does not support ssl in development.
 */
const fileUploadProxy = async (req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV === "production") {
    res.status(400);
    res.send({
      error: "File upload proxy not supported in production environment!",
    });
    return;
  }

  const { path, ...params } = req.query;
  if (!req.url || !Array.isArray(path)) {
    res.status(400);
    res.send({ error: "Invalid path" });
    return;
  }

  const contentType = req.headers["content-type"];
  if (!contentType) {
    res.status(400);
    res.send({ error: "Content-Type must be set!" });
    return;
  }

  const storageUrl = new URL(env.FILE_STORAGE_ENDPOINT);
  storageUrl.hostname = `${env.FILE_STORAGE_BUCKET}.${storageUrl.hostname}`;
  storageUrl.pathname = path.join("/");

  const paramMaps = Object.fromEntries(
    Object.keys(params).flatMap((key) => {
      const values = params[key];
      if (values === undefined) return [];
      if (Array.isArray(values)) return values.map((value) => [key, value]);
      return [[key, values]];
    }),
  );
  storageUrl.search = new URLSearchParams(paramMaps).toString();

  const body = await getRawBody(req);

  const uploadRes = await fetch(storageUrl, {
    method: req.method,
    body: body,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.length),
      "x-amz-acl": "public-read",
    },
  });

  res.status(uploadRes.status);
  res.send(uploadRes.body);
};

export default fileUploadProxy;

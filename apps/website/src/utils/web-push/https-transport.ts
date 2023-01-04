import type { RequestOptions } from "https";
import type { IncomingHttpHeaders } from "http";
import { request } from "https";

type NotificationResponse = {
  statusCode?: number;
  body: string;
  headers: IncomingHttpHeaders;
};

export type WebPushHttpsRequestOptions = {
  agent?: RequestOptions["agent"];
  headers?: RequestOptions["headers"];
  timeout?: RequestOptions["timeout"];
};

export function requestHttps(
  endpoint: string,
  body?: Buffer | string | null,
  options?: WebPushHttpsRequestOptions
) {
  return new Promise<NotificationResponse>((resolve, reject) => {
    const pushRequest = request(
      endpoint,
      {
        method: "POST",
        headers: options?.headers,
        timeout: options?.timeout,
        agent: options?.agent,
      },
      (pushResponse) => {
        let responseText = "";

        pushResponse.on("data", (chunk) => {
          responseText += chunk;
        });

        pushResponse.on("end", () => {
          if (
            pushResponse.statusCode &&
            (pushResponse.statusCode < 200 || pushResponse.statusCode > 299)
          ) {
            reject(
              new Error(
                "Received unexpected response code " +
                  pushResponse.statusCode +
                  " - " +
                  responseText
              )
            );
          } else {
            resolve({
              statusCode: pushResponse.statusCode,
              body: responseText,
              headers: pushResponse.headers,
            });
          }
        });
      }
    );

    if (options?.timeout) {
      pushRequest.on("timeout", () => {
        pushRequest.destroy(new Error("Socket timeout"));
      });
    }

    pushRequest.on("error", (e) => {
      reject(e);
    });

    if (body) {
      pushRequest.write(body);
    }

    pushRequest.end();
  });
}

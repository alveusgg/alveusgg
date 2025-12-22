import probe from "probe-image-size";

export async function probeImageMeta(url: string) {
  try {
    const { width, height, orientation, type, mime } = await probe(url, {
      open_timeout: 1_000,
      response_timeout: 1_000,
      read_timeout: 1_0000,
      follow_max: 3,
      parse_response: false,
      // Use to ignore bad certificates.
      //rejectUnauthorized: false,
      headers: {
        "User-Agent": "alveus.gg",
      },
    });

    const isRotated = orientation ? orientation > 4 : false;

    return {
      width: isRotated ? height : width,
      height: isRotated ? width : height,
      type,
      mimeType: mime,
      url,
    };
  } catch (_) {
    return false;
  }
}

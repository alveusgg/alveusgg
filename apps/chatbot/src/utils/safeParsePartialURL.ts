export function safeParsePartialURL(maybeUrl: string | undefined | null) {
  if (maybeUrl) {
    const hasProtocol =
      maybeUrl.startsWith("http://") || maybeUrl.startsWith("https://");
    if (!hasProtocol) {
      maybeUrl = `https://${maybeUrl}`;
    }

    try {
      const parsedUrl = new URL(maybeUrl);
      // Check if the URL has a top-level domain, or we assume it's not a URL
      if (parsedUrl && parsedUrl.hostname.match(/\.\w/)) {
        return parsedUrl.toString();
      }
    } catch (_) {
      // invalid URL, ignore
    }
  }

  return undefined;
}

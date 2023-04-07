export type ParsedVideoUrl = {
  platform: keyof typeof videoPlatformConfigs;
  id: string;
  normalizedUrl: string;
};

export type VideoPlatform = keyof typeof videoPlatformConfigs;
export type VideoPlatformConfig = (typeof videoPlatformConfigs)[VideoPlatform];

export const videoPlatformConfigs = {
  youtube: {
    key: "youtube",
    label: "YouTube",
    replacement: (id: string) => `https://www.youtube.com/watch?v=${id}`,
    example: "https://www.youtube.com/watch?v=zEbsSAkVMpQ",
    regex:
      /(?:https?:)?(?:\/\/)?(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:(?:watch)?\?(?:app=[a-z]+&)?(?:feature=\w*&)?vi?=|embed\/|vi?\/|e\/)|youtu.be\/)([\w\-]{10,20})/i,
    normalizedRegex: /https:\/\/www\.youtube\.com\/watch\?v=([\w\-]{10,20})/,
    embedUrl: (id: string) =>
      `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1`,
  },
  streamable: {
    key: "streamable",
    label: "Streamable",
    replacement: (id: string) => `https://streamable.com/${id}`,
    example: "https://streamable.com/a40ywf",
    regex:
      /(?:https?:)?(?:\/\/)?(?:www\.)?streamable\.com\/(?:o\/)?([a-z0-9]+)/i,
    normalizedRegex: /https:\/\/streamable\.com\/([a-z0-9]+)/,
    //embedUrl: (id: string) => `https://streamable.com/e/${id}`,
  },
  imgurGallery: {
    key: "imgurGallery",
    label: "Imgur Gallery",
    replacement: (id: string) => `https://imgur.com/a/${id}`,
    example: "https://imgur.com/a/yaJMyAR",
    regex:
      /(?:https?:)?(?:\/\/)?(?:(?:www|i)\.)?imgur\.com\/(?:a|g|gallery)\/([a-z0-9]+)/i,
    normalizedRegex: /https:\/\/imgur\.com\/a\/([a-z0-9]+)/,
  },
  imgur: {
    key: "imgur",
    label: "Imgur Image",
    replacement: (id: string) => `https://imgur.com/${id}`,
    example: "https://imgur.com/yaJMyAR",
    regex: /(?:https?:)?(?:\/\/)?(?:(?:www|i)\.)?imgur\.com\/([a-z0-9]+)/i,
    normalizedRegex: /https:\/\/imgur\.com\/([a-z0-9]+)/,
  },
} as const;

export function validateNormalizedVideoUrl(url: string) {
  for (const config of Object.values(videoPlatformConfigs)) {
    if (config.normalizedRegex.test(url)) {
      return true;
    }
  }
  return false;
}

const parsedVideoUrlCache = new Map<string, ParsedVideoUrl>();
export function parseVideoUrl(url: string) {
  const cached = parsedVideoUrlCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  for (const [key, config] of Object.entries(videoPlatformConfigs)) {
    const match = url.match(config.regex);
    if (match) {
      const platform = key as keyof typeof videoPlatformConfigs;
      const id = String(match[1]);
      const normalizedUrl = config.replacement(id);
      const result = {
        platform,
        id,
        normalizedUrl,
      };
      parsedVideoUrlCache.set(url, result);
      return result;
    }
  }

  return null;
}

export function extractVideoId(url: string) {
  return parseVideoUrl(url)?.id;
}

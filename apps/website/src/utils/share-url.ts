interface ShareProps {
  url: string;
  title?: string;
  text?: string;
}

export const twitterShareUrl = ({ url, title, text }: ShareProps) => {
  const share = new URL("https://twitter.com/intent/tweet");
  share.searchParams.append("url", url);
  if (text || title)
    share.searchParams.append("text", (text || title) as string);
  share.searchParams.append("via", "AlveusSanctuary");
  return share.toString();
};

export const blueskyShareUrl = ({ url, title, text }: ShareProps) => {
  const share = new URL("https://bsky.app/intent/compose");
  share.searchParams.append(
    "text",
    [title, text, url].filter(Boolean).join("\n\n"),
  );
  return share.toString();
};

export const facebookShareUrl = ({ url, title, text }: ShareProps) => {
  // NOTE: This is the old way of sharing -- it no longer accepts title
  //       The new dialog method needs an app ID though, so we're not using it
  //       https://developers.facebook.com/docs/sharing/reference/share-dialog#redirect
  const share = new URL("https://www.facebook.com/sharer/sharer.php");
  share.searchParams.append("u", url);
  if (text || title) share.searchParams.append("t", (text || title) as string);
  return share.toString();
};

export const linkedinShareUrl = ({ url, title, text }: ShareProps) => {
  // NOTE: This is the old way of sharing -- it no longer accepts title/summary
  //       The new feed method doesn't appear to be documented, but it works
  // const share = new URL("https://www.linkedin.com/shareArticle");
  // share.searchParams.append("mini", "true");
  // share.searchParams.append("url", url);
  // if (title) share.searchParams.append("title", title);
  // if (text) share.searchParams.append("summary", text);
  const share = new URL("https://www.linkedin.com/feed");
  share.searchParams.append("shareActive", "true");
  share.searchParams.append(
    "text",
    [title, text, url].filter(Boolean).join("\n\n"),
  );
  return share.toString();
};

export const emailShareUrl = ({ url, title, text }: ShareProps) => {
  const share = new URL("mailto:");
  share.searchParams.append("subject", title || url);
  share.searchParams.append("body", [text, url].filter(Boolean).join("\n\n"));
  return share.toString().replaceAll("+", "%20");
};

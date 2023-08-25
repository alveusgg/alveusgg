import Head from "next/head";
import { type ReactNode, type FC } from "react";

import headerImage from "@/assets/header.png";
import { createImageUrl } from "@/utils/image";
import { env } from "@/env/index.mjs";

type MetaProps = {
  title?: string;
  description?: string;
  image?: string;
  children?: ReactNode;
};

// Get our base URL, which will either be specifically set, or from Vercel for preview deployments
const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

const Meta: FC<MetaProps> = ({ title, description, image, children }) => {
  const defaultTitle = "Alveus Sanctuary";
  const defaultDescription =
    "Alveus is a 501(c)(3) nonprofit organization functioning as a wildlife sanctuary & virtual education center following the journeys of our non-releasable ambassadors, aiming to educate and spark an appreciation for them and their wild counterparts.";
  const computedTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const computedDescription = description || defaultDescription;

  // Use the Next.js image loader, and use an absolute URL
  const computedImage =
    BASE_URL +
    createImageUrl({
      src: image || headerImage.src,
      width: 1200,
    });

  return (
    <Head>
      <title key="title">{computedTitle}</title>
      <meta
        key="description"
        name="description"
        content={computedDescription}
      />
      <meta key="og:title" property="og:title" content={computedTitle} />
      <meta
        key="og:description"
        property="og:description"
        content={computedDescription}
      />
      <meta key="og:image" property="og:image" content={computedImage} />
      <meta key="og:type" property="og:type" content="website" />
      <meta
        key="twitter:card"
        name="twitter:card"
        content="summary_large_image"
      />
      <meta key="twitter:site" name="twitter:site" content="@AlveusSanctuary" />
      <meta
        key="twitter:creator"
        name="twitter:creator"
        content="@AlveusSanctuary"
      />
      <meta key="twitter:title" name="twitter:title" content={computedTitle} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={computedDescription}
      />
      <meta key="twitter:image" name="twitter:image" content={computedImage} />
      {env.NEXT_PUBLIC_NOINDEX === "true" && (
        <meta key="robots" name="robots" content="noindex" />
      )}
      {children}
    </Head>
  );
};

export default Meta;

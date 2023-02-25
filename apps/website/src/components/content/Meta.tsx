import Head from "next/head";
import defaultLoader from "next/dist/shared/lib/image-loader";
import { type ImageConfigComplete } from "next/dist/shared/lib/image-config";
import React from "react";

import logoImage from "../../assets/logo.png";

// Get our base URL, which will either be specifically set, or from Vercel for preview deployments
const BASE_URL = (
  process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || ""
).replace(/\/$/, "");

type MetaProps = {
  title?: string;
  description?: string;
  image?: string;
};

const Meta: React.FC<MetaProps> = ({ title, description, image }) => {
  const defaultTitle = "Alveus.gg";
  const defaultDescription =
    "Alveus is a 501(c)(3) nonprofit organization functioning as a wildlife sanctuary & virtual education center following the journeys of our non-releasable ambassadors, aiming to educate and spark an appreciation for them and their wild counterparts.";
  const computedTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const computedDescription = description || defaultDescription;

  // Based on https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L23-L25
  // and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L743-L748
  // and https://github.com/vercel/next.js/blob/e0e81ea049483aa877c8e366ce47e5f0c176b0ae/packages/next/src/client/image.tsx#L191-L193
  const imageConfig = process.env.__NEXT_IMAGE_OPTS as never as ImageConfigComplete
  const imageSizes = [ ...imageConfig.deviceSizes, ...imageConfig.imageSizes ];
  const computedImage =
    BASE_URL +
    defaultLoader({
      src: image || logoImage.src,
      width: imageSizes.find((w) => w >= 512) || imageSizes[imageSizes.length - 1] || 0,
      quality: 75,
      config: imageConfig,
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
    </Head>
  );
};

export default Meta;

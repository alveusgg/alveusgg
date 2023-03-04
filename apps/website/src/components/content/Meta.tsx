import Head from "next/head";
import React from "react";

import headerImage from "@/assets/header.png";
import { createImageUrl, getImageSizes } from "@/utils/image";

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

  const imageSizes = getImageSizes();
  const computedImage = createImageUrl({
    src: image || headerImage.src,
    width:
      imageSizes.find((w) => w >= 1200) ||
      imageSizes[imageSizes.length - 1] ||
      0,
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

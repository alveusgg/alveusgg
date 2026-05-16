import Image, { type ImageProps } from "next/image";
import { type ReactNode, useMemo } from "react";

import { classes } from "@/utils/classes";

import bottleWinnie from "@/assets/merch/bottle-winnie.png";
import crewneckUvScorpion from "@/assets/merch/crewneck-uv-scorpion.png";
import hatMartyParty from "@/assets/merch/hat-marty-party.png";
import hoodieLivecams from "@/assets/merch/hoodie-livecams.png";
import mugAmbassadors from "@/assets/merch/mug-ambassadors.png";
import mugGeorgie from "@/assets/merch/mug-georgie.png";
import posterPasturePals from "@/assets/merch/poster-pasture-pals.png";
import totePushpop from "@/assets/merch/tote-pushpop.png";
import tshirtAmbassadorFaces from "@/assets/merch/tshirt-ambassador-faces.png";
import tshirtHankTheTank from "@/assets/merch/tshirt-hank-the-tank.png";
import tshirtPushpopStory from "@/assets/merch/tshirt-pushpop-story.png";
import georgieImage from "@/assets/plushies/georgie.png";
import mayaImage from "@/assets/plushies/maya.png";
import sirenImage from "@/assets/plushies/siren.png";
import stompyImage from "@/assets/plushies/stompy.png";
import winnieImage from "@/assets/plushies/winnie.png";

import Carousel from "./Carousel";

interface Item {
  src: ImageProps["src"];
  alt: string;
  size?: `w-${number}/${number}`;
  pip?: {
    src: ImageProps["src"];
    alt: string;
    position?: "bottom" | "top";
  };
}

const allItems = {
  merch: {
    tshirtAmbassadorFaces: {
      src: tshirtAmbassadorFaces,
      alt: "Lindsay wearing the Ambassador Faces T-Shirt",
    },
    posterPasturePals: {
      src: posterPasturePals,
      alt: "Connor holding the Pasture Pals Poster",
    },
    bottleWinnie: {
      src: bottleWinnie,
      alt: "Jacob holding the Winnie The Moo Water Bottle",
    },
    crewneckUvScorpion: {
      src: crewneckUvScorpion,
      alt: "Maya wearing the UV Scorpion Crewneck",
    },
    tshirtHankTheTank: {
      src: tshirtHankTheTank,
      alt: "Sruti wearing the Hank The Tank T-Shirt",
    },
    mugAmbassadors: {
      src: mugAmbassadors,
      alt: "Daniel holding the Ambassadors Mug",
    },
    totePushpop: {
      src: totePushpop,
      alt: "Rocky holding the Pushpop Tote Bag",
    },
    hoodieLivecams: {
      src: hoodieLivecams,
      alt: "Lindsay wearing the Livecams Hoodie",
    },
    mugGeorgie: {
      src: mugGeorgie,
      alt: "Maya holding the Georgie Mug",
    },
    tshirtPushpopStory: {
      src: tshirtPushpopStory,
      alt: "Daniel wearing the Pushpop Story T-Shirt",
    },
    hatMartyParty: {
      src: hatMartyParty,
      alt: "Marty on the Marty Party Hat",
    },
  },
  plushies: {
    siren: {
      src: sirenImage,
      alt: "Siren plushie",
    },
    maya: {
      src: mayaImage,
      alt: "Maya, holding all the plushies",
    },
    winnie: {
      src: winnieImage,
      alt: "Winnie plushie",
    },
    georgy: {
      src: georgieImage,
      alt: "Georgie plushie",
    },
    stompy: {
      src: stompyImage,
      alt: "Stompy plushie",
    },
  },
} as const satisfies Record<string, Record<string, Item>>;

type MerchType = keyof typeof allItems;

type KeysOfUnion<T> = T extends T ? keyof T : never;
type MerchItem = KeysOfUnion<(typeof allItems)[MerchType]>;

// When the type is "all", we want to zip together all the items from all the
// categories. We do a zip so that the items seem to be in a random order.
const zipAllItems = (): Record<string, Item> => {
  const merchType = Object.keys(allItems) as MerchType[];
  const maxLength = Math.max(
    ...merchType.map((type) => Object.keys(allItems[type]).length),
  );
  const zippedItems: Record<string, Item> = {};

  for (let i = 0; i < maxLength; i++) {
    for (const type of merchType) {
      const items = allItems[type] as Record<MerchItem, Item>;
      const keys = Object.keys(items) as MerchItem[];

      const key = i < keys.length && keys[i];
      if (key) {
        zippedItems[`${type}-${key}`] = items[key];
      }
    }
  }

  return zippedItems;
};

const MerchCarousel = ({
  type = "all",
  more = false,
}: {
  type?: MerchType | "all";
  more?: boolean;
}) => {
  const items = useMemo(
    () =>
      Object.entries<Item>(
        type === "all" ? zipAllItems() : allItems[type],
      ).reduce<Record<string, ReactNode>>(
        (obj, [key, { src, alt, size, pip }]) => ({
          ...obj,
          [key]: (
            <div className="relative mx-auto h-auto w-full max-w-40">
              <Image
                src={src}
                alt={alt}
                title={alt}
                draggable={false}
                width={200}
                className={classes(
                  "mx-auto h-auto max-h-32 object-contain drop-shadow-sm",
                  size || "w-full",
                  pip?.position === "top" && "relative -right-2 -bottom-2",
                )}
              />

              {pip && (
                <Image
                  src={pip.src}
                  alt={pip.alt}
                  title={pip.alt}
                  draggable={false}
                  width={80}
                  className={classes(
                    "absolute h-auto drop-shadow-sm",
                    pip.position === "top"
                      ? "-top-2 -left-2"
                      : "-right-2 -bottom-2",
                  )}
                />
              )}
            </div>
          ),
        }),
        {},
      ),
    [type],
  );

  return (
    <Carousel
      items={items}
      wrapperClassName="items-center"
      itemClassName={classes(
        "basis-full p-2 sm:basis-1/2 lg:basis-1/3",
        more && "xl:basis-1/4 2xl:basis-1/6",
      )}
    />
  );
};

export default MerchCarousel;

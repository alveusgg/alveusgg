import { useMemo, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

import { classes } from "@/utils/classes";

import sirenImage from "@/assets/plushies/siren.png";
import winnieImage from "@/assets/plushies/winnie.png";
import georgieImage from "@/assets/plushies/georgie.png";
import stompyImage from "@/assets/plushies/stompy.png";
import mayaImage from "@/assets/plushies/maya.png";

import Carousel from "./Carousel";

interface Item {
  src: ImageProps["src"];
  alt: string;
  pip?: {
    src: ImageProps["src"];
    alt: string;
  };
}

const allItems = {
  merch: {},
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
        (obj, [key, { src, alt, pip }]) => ({
          ...obj,
          [key]: (
            <div className="relative mx-auto h-auto w-full max-w-40">
              <Image
                src={src}
                alt={alt}
                title={alt}
                draggable={false}
                width={200}
                className="h-auto w-full drop-shadow-sm"
              />

              {pip && (
                <Image
                  src={pip.src}
                  alt={pip.alt}
                  title={pip.alt}
                  draggable={false}
                  width={80}
                  className="absolute -right-2 -bottom-2 h-auto w-1/2 max-w-20 drop-shadow-sm"
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
        "basis-full sm:basis-1/2 lg:basis-1/3 p-2",
        more && "xl:basis-1/4 2xl:basis-1/6",
      )}
    />
  );
};

export default MerchCarousel;

import { useMemo, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

import { classes } from "@/utils/classes";

import beanieDoodleImage from "@/assets/merch/beanie-doodle.png";
import beanieNoodleImage from "@/assets/merch/beanie-noodle.png";
import bottleStickersImage from "@/assets/merch/bottle-stickers.png";
// import capDoodleImage from "@/assets/merch/cap-doodle.png";
// import capNoodleImage from "@/assets/merch/cap-noodle.png";
import hoodieAdventureImage from "@/assets/merch/hoodie-adventure.png";
import hoodieMagazineImage from "@/assets/merch/hoodie-magazine.png";
import hoodiePanelsImage from "@/assets/merch/hoodie-panels.png";
import mugBarbaraImage from "@/assets/merch/mug-barbara.png";
import mugDoodleImage from "@/assets/merch/mug-doodle.png";
import mugFennReedImage from "@/assets/merch/mug-fenn-reed.png";
import mugSirenImage from "@/assets/merch/mug-siren.png";
import sweaterBugsImage from "@/assets/merch/sweater-bugs.png";
import sweaterWinnieImage from "@/assets/merch/sweater-winnie.png";
// import toteFramesImage from "@/assets/merch/tote-frames.png";
// import toteGeometricImage from "@/assets/merch/tote-geometric.png";
import tshirtBubbleImage from "@/assets/merch/tshirt-bubble.png";
import tshirtBugsImage from "@/assets/merch/tshirt-bugs.png";
import tshirtPatchyImage from "@/assets/merch/tshirt-patchy.png";

import tshirtPatchyMayaImage from "@/assets/merch/tshirt-patchy-maya.png";
import hoodieAdventureConnorImage from "@/assets/merch/hoodie-adventure-connor.png";
import sweaterBugsAmandaImage from "@/assets/merch/sweater-bugs-amanda.png";
import sweaterWinnieLindsayImage from "@/assets/merch/sweater-winnie-lindsay.png";

import sirenImage from "@/assets/plushies/siren.png";
import winnieImage from "@/assets/plushies/winnie.png";
import georgieImage from "@/assets/plushies/georgie.png";
import stompyImage from "@/assets/plushies/stompy.png";
import mayaImage from "@/assets/plushies/maya.png";

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
    tshirtPatchyMaya: {
      src: tshirtPatchyMayaImage,
      alt: "Maya wearing the Patchy t-shirt",
    },
    tshirtBubblePatchy: {
      src: tshirtBubbleImage,
      alt: "Bubble t-shirt",
      pip: {
        src: tshirtPatchyImage,
        alt: "Patchy t-shirt",
      },
    },
    mugSirenBarbara: {
      src: mugSirenImage,
      alt: "Siren mug",
      pip: {
        src: mugBarbaraImage,
        alt: "Barbara mug",
      },
    },
    hoodieAdventureConnor: {
      src: hoodieAdventureConnorImage,
      alt: "Connor wearing the Adventure hoodie",
    },
    hoodiePanelsAdventure: {
      src: hoodiePanelsImage,
      alt: "Panels hoodie",
      pip: {
        src: hoodieAdventureImage,
        alt: "Adventure hoodie",
      },
    },
    mugFeenReedDoodle: {
      src: mugFennReedImage,
      alt: "Fenn and Reed mug",
      pip: {
        src: mugDoodleImage,
        alt: "Doodle mug",
      },
    },
    tshirtBugsSweater: {
      src: tshirtBugsImage,
      alt: "Bugs t-shirt",
      pip: {
        src: sweaterBugsImage,
        alt: "Bugs sweater",
      },
    },
    sweaterBugsAmanda: {
      src: sweaterBugsAmandaImage,
      alt: "Amanda wearing the Bugs sweater",
    },
    bottleStickers: {
      src: bottleStickersImage,
      alt: "Sticker bottle",
      size: "w-2/3",
    },
    beanieDoodleNoodle: {
      src: beanieDoodleImage,
      alt: "Doodle beanie",
      pip: {
        src: beanieNoodleImage,
        alt: "Noodle beanie",
        position: "top",
      },
    },
    sweaterWinnieHoodieMagazine: {
      src: sweaterWinnieImage,
      alt: "Winnie sweater",
      pip: {
        src: hoodieMagazineImage,
        alt: "Magazine hoodie",
      },
    },
    sweaterWinnieLindsay: {
      src: sweaterWinnieLindsayImage,
      alt: "Lindsay wearing the Winnie sweater",
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
                  "mx-auto h-auto drop-shadow-sm",
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
        "basis-full sm:basis-1/2 lg:basis-1/3 p-2",
        more && "xl:basis-1/4 2xl:basis-1/6",
      )}
    />
  );
};

export default MerchCarousel;

import { useMemo, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

import { classes } from "@/utils/classes";

import beanieNoodleImage from "@/assets/merch/beanie-noodle.png";
import beaniePeepoImage from "@/assets/merch/beanie-peepo.png";
import bottleFriendsImage from "@/assets/merch/bottle-friends.png";
// import capNoodleImage from "@/assets/merch/cap-noodle.png";
// import capPeepoImage from "@/assets/merch/cap-peepo.png";
import hoodieKidsImage from "@/assets/merch/hoodie-kids.png";
import hoodiePeepoRangerImage from "@/assets/merch/hoodie-peepo-ranger.png";
import hoodiePolaroidImage from "@/assets/merch/hoodie-polaroid.png";
import mugCountryGirlsImage from "@/assets/merch/mug-country-girls.png";
import mugDoodleImage from "@/assets/merch/mug-doodle.png";
import mugFennReedImage from "@/assets/merch/mug-fenn-reed.png";
import mugSirenImage from "@/assets/merch/mug-siren.png";
import onesieViewerTrainingImage from "@/assets/merch/onesie-viewer-training.png";
import sweaterProtectFriendsImage from "@/assets/merch/sweater-protect-friends.png";
// import sweaterWinnieImage from "@/assets/merch/sweater-winnie.png";
// import toteGalleryImage from "@/assets/merch/tote-gallery.png";
// import toteMosaicImage from "@/assets/merch/tote-mosaic.png";
import tshirtBugHuntImage from "@/assets/merch/tshirt-bug-hunt.png";
import tshirtPatchyImage from "@/assets/merch/tshirt-patchy.png";
import tshirtYouthImage from "@/assets/merch/tshirt-youth.png";

import tshirtPatchyMayaImage from "@/assets/merch/tshirt-patchy-maya.png";
import hoodiePeepoRangerConnorImage from "@/assets/merch/hoodie-peepo-ranger-connor.png";
import sweaterProtectFriendsAmandaImage from "@/assets/merch/sweater-protect-friends-amanda.png";
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
      alt: "Maya wearing the Patchy Tee",
    },
    tshirtYouthPatchy: {
      src: tshirtYouthImage,
      alt: "Youth Tee",
      pip: {
        src: tshirtPatchyImage,
        alt: "Patchy Tee",
      },
    },
    mugSirenBarbara: {
      src: mugSirenImage,
      alt: "Siren's Yappers Club Mug",
      pip: {
        src: mugCountryGirlsImage,
        alt: "Country Girls Make Do Mug",
      },
    },
    hoodiePeepoRangerConnor: {
      src: hoodiePeepoRangerConnorImage,
      alt: "Connor wearing the Peepo Ranger Hoodie",
    },
    tshirtBugHuntSweater: {
      src: tshirtBugHuntImage,
      alt: "Bug Hunt Tee",
      pip: {
        src: sweaterProtectFriendsImage,
        alt: "Protect Our Friends Crewneck",
      },
    },
    mugFeenReedDoodle: {
      src: mugFennReedImage,
      alt: "Fenn and Reed Mug",
      pip: {
        src: mugDoodleImage,
        alt: "Doodle Mug",
      },
    },
    hoodiePeepoRangerKids: {
      src: hoodiePeepoRangerImage,
      alt: "Peepo Ranger Hoodie",
      pip: {
        src: hoodieKidsImage,
        alt: "Kids Hoodie",
      },
    },
    bottleFriends: {
      src: bottleFriendsImage,
      alt: "Alveus Friends Water Bottle",
      size: "w-2/3",
    },
    sweaterProtectFriendsAmanda: {
      src: sweaterProtectFriendsAmandaImage,
      alt: "Amanda wearing the Protect Our Friends Crewneck",
    },
    beaniePeepoNoodle: {
      src: beaniePeepoImage,
      alt: "Peepo Beanie",
      pip: {
        src: beanieNoodleImage,
        alt: "Noodle Beanie",
        position: "top",
      },
    },
    hoodiePolaroidOnesieViewerTraining: {
      src: hoodiePolaroidImage,
      alt: "Polariod Hoodie",
      pip: {
        src: onesieViewerTrainingImage,
        alt: "Viewer In Training Onesie",
      },
    },
    sweaterWinnieLindsay: {
      src: sweaterWinnieLindsayImage,
      alt: "Lindsay wearing the Winnie The Moo Crew",
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

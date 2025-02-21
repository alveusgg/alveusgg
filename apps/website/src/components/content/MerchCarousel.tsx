import { useMemo, type ReactNode } from "react";
import Image, { type ImageProps } from "next/image";

import tshirtFront from "@/assets/merch/tshirt-front.png";
import tshirtDemoGrinder from "@/assets/merch/tshirt-demo-grinder.png";
import tshirtBack from "@/assets/merch/tshirt-back.png";
import tshirtDemoAppa from "@/assets/merch/tshirt-demo-appa.png";
import tshirtDemoMia from "@/assets/merch/tshirt-demo-mia.png";
import hoodieFront from "@/assets/merch/hoodie-front.png";
import hoodieBack from "@/assets/merch/hoodie-back.png";
import hoodieDemoGeorgie from "@/assets/merch/hoodie-demo-georgie.png";

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
  merch: {
    tshirtFront: {
      src: tshirtFront,
      alt: "Alveus T-Shirt (Front)",
      pip: {
        src: tshirtBack,
        alt: "Alveus T-Shirt (Back)",
      },
    },
    tshirtDemoGrinder: {
      src: tshirtDemoGrinder,
      alt: "Alveus T-Shirt (Front) - Demo w/ Grinder",
    },
    hoodieFront: {
      src: hoodieFront,
      alt: "Alveus Hoodie (Front)",
      pip: {
        src: hoodieBack,
        alt: "Alveus Hoodie (Back)",
      },
    },
    hoodieDemoGeorgie: {
      src: hoodieDemoGeorgie,
      alt: "Alveus Hoodie (Back) - Demo w/ Georgie",
    },
    tshirtBack: {
      src: tshirtBack,
      alt: "Alveus T-Shirt (Back)",
      pip: {
        src: tshirtFront,
        alt: "Alveus T-Shirt (Front)",
      },
    },
    tshirtDemoAppa: {
      src: tshirtDemoAppa,
      alt: "Alveus T-Shirt (Back) - Demo w/ Appa",
    },
    hoodieBack: {
      src: hoodieBack,
      alt: "Alveus Hoodie (Back)",
      pip: {
        src: hoodieFront,
        alt: "Alveus Hoodie (Front)",
      },
    },
    tshirtDemoMia: {
      src: tshirtDemoMia,
      alt: "Alveus T-Shirt (Back) - Demo w/ Mia",
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

const MerchCarousel = ({ type = "all" }: { type?: MerchType | "all" }) => {
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
                draggable={false}
                width={200}
                className="h-auto w-full drop-shadow-sm"
              />

              {pip && (
                <Image
                  src={pip.src}
                  alt={pip.alt}
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
      itemClassName="basis-full sm:basis-1/2 lg:basis-1/3 p-2"
    />
  );
};

export default MerchCarousel;

import Image from "next/image";

import sirenImage from "@/assets/plushies/siren.png";
import winnieImage from "@/assets/plushies/winnie.png";
import georgieImage from "@/assets/plushies/georgie.png";
import stompyImage from "@/assets/plushies/stompy.png";
import mayaImage from "@/assets/plushies/maya.png";

import Carousel from "./Carousel";

const merch = Object.entries({
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
}).reduce(
  (obj, [key, { src, alt }]) => ({
    ...obj,
    [key]: (
      <div className="relative mx-auto h-auto w-full max-w-[10rem]">
        <Image
          src={src}
          alt={alt}
          draggable={false}
          width={200}
          className="h-auto w-full drop-shadow"
        />
      </div>
    ),
  }),
  {},
);

const PlushieCarousel = () => (
  <Carousel
    items={merch}
    wrapperClassName="items-center"
    itemClassName="basis-full sm:basis-1/2 lg:basis-1/3 p-2"
  />
);

export default PlushieCarousel;

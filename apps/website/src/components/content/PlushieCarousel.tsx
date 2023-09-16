import Image from "next/image";

import winnieImage from "@/assets/plushies/winnie.png";
import georgieImage from "@/assets/plushies/georgie.png";
import stompyImage from "@/assets/plushies/stompy.png";

import Carousel from "./Carousel";

const merch = Object.entries({
  winnie: {
    src: winnieImage,
    alt: "Winnie",
  },
  georgy: {
    src: georgieImage,
    alt: "Georgie",
  },
  stompy: {
    src: stompyImage,
    alt: "Stompy",
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
  {}
);

const PlushieCarousel = () => (
  <Carousel
    items={merch}
    wrapperClassName="items-center"
    itemClassName="basis-full sm:basis-1/2 lg:basis-1/3 p-2"
  />
);

export default PlushieCarousel;

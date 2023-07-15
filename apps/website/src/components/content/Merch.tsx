import Image from "next/image";

import caseMerchImage from "@/assets/merch/biodegradable-iphone-case-iphone-11-pro-max-case-on-phone.png";
import toteMerchImage from "@/assets/merch/large-eco-tote-oyster-front.png";
import tshirtMerchImage from "@/assets/merch/organic-cotton-t-shirt-dress-black-front.png";
import croptopMerchImage from "@/assets/merch/organic-crop-top-black-front.png";
import beanieMerchImage from "@/assets/merch/organic-ribbed-beanie-black-front.png";
import hoodieMerchImage from "@/assets/merch/unisex-essential-eco-hoodie-white-front.png";

import Carousel from "./Carousel";

const merch = Object.entries({
  hoodie: {
    src: hoodieMerchImage,
    alt: "Unisex Essential Echo Hoodie (White)",
  },
  case: {
    src: caseMerchImage,
    alt: "Biodegradable iPhone Case (iPhone 11 Pro Max)",
  },
  tshirt: {
    src: tshirtMerchImage,
    alt: "Organic Cotton T-Shirt Dress (Black)",
  },
  croptop: {
    src: croptopMerchImage,
    alt: "Organic Crop Top (Black)",
  },
  tote: {
    src: toteMerchImage,
    alt: "Large Eco Tote (Oyster)",
  },
  beanie: {
    src: beanieMerchImage,
    alt: "Organic Ribbed Beanie (Black)",
  },
}).reduce(
  (obj, [key, { src, alt }]) => ({
    ...obj,
    [key]: (
      <Image
        src={src}
        alt={alt}
        draggable={false}
        width={200}
        className="mx-auto h-auto w-full max-w-[10rem]"
      />
    ),
  }),
  {}
);

const Scroller = () => <Carousel items={merch} />;

export default Scroller;

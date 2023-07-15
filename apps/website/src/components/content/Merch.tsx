import Image from "next/image";

import tshirtFront from "@/assets/merch/tshirt-front.png";
import tshirtDemoGrinder from "@/assets/merch/tshirt-demo-grinder.png";
import tshirtBack from "@/assets/merch/tshirt-back.png";
import tshirtDemoAppa from "@/assets/merch/tshirt-demo-appa.png";
import tshirtDemoMia from "@/assets/merch/tshirt-demo-mia.png";
import hoodieFront from "@/assets/merch/hoodie-front.png";
import hoodieBack from "@/assets/merch/hoodie-back.png";
import hoodieDemoGeorgie from "@/assets/merch/hoodie-demo-georgie.png";

import Carousel from "./Carousel";

const merch = Object.entries({
  tshirtFront: {
    src: tshirtFront,
    alt: "Alveus T-Shirt (Front)",
  },
  tshirtDemoGrinder: {
    src: tshirtDemoGrinder,
    alt: "Alveus T-Shirt (Front) - Demo w/ Grinder",
  },
  tshirtBack: {
    src: tshirtBack,
    alt: "Alveus T-Shirt (Back)",
  },
  tshirtDemoAppa: {
    src: tshirtDemoAppa,
    alt: "Alveus T-Shirt (Back) - Demo w/ Appa",
  },
  tshirtDemoMia: {
    src: tshirtDemoMia,
    alt: "Alveus T-Shirt (Back) - Demo w/ Mia",
  },
  hoodieFront: {
    src: hoodieFront,
    alt: "Alveus Hoodie (Front)",
  },
  hoodieBack: {
    src: hoodieBack,
    alt: "Alveus Hoodie (Back)",
  },
  hoodieDemoGeorgie: {
    src: hoodieDemoGeorgie,
    alt: "Alveus Hoodie (Back) - Demo w/ Georgie",
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

const Scroller = () => (
  <Carousel items={merch} wrapperClassName="items-center" />
);

export default Scroller;

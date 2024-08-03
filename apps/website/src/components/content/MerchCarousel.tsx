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
}).reduce(
  (obj, [key, { src, alt, pip }]) => ({
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

        {pip && (
          <Image
            src={pip.src}
            alt={pip.alt}
            draggable={false}
            width={80}
            className="absolute -bottom-2 -right-2 h-auto w-1/2 max-w-[5rem] drop-shadow"
          />
        )}
      </div>
    ),
  }),
  {},
);

const Merch = () => (
  <Carousel
    items={merch}
    wrapperClassName="items-center"
    itemClassName="basis-full sm:basis-1/2 lg:basis-1/3 p-2"
  />
);

export default Merch;

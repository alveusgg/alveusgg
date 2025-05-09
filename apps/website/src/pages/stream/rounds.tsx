import { type NextPage } from "next";
import Image from "next/image";

import {
  type AmbassadorImage,
  getAmbassadorImages,
} from "@alveusgg/data/build/ambassadors/images";

interface Check {
  name: string;
  icon: AmbassadorImage;
}

const checks: Record<string, Check> = {
  foxes: {
    name: "Foxes",
    icon: getAmbassadorImages("reed")[0],
  },
  wolfdogs: {
    name: "Wolfdogs",
    icon: getAmbassadorImages("awa")[0],
  },
  pushpop: {
    name: "Push Pop",
    icon: getAmbassadorImages("pushPop")[0],
  },
  crows: {
    name: "Crows",
    icon: getAmbassadorImages("abbott")[0],
  },
  marmosets: {
    name: "Marmosets",
    icon: getAmbassadorImages("appa")[0],
  },
  critters: {
    name: "Insects/Reptiles",
    icon: getAmbassadorImages("barbaraBakedBean")[0],
  },
  winnie: {
    name: "Winnie",
    icon: getAmbassadorImages("winnieTheMoo")[0],
  },
  stompy: {
    name: "Stompy",
    icon: getAmbassadorImages("stompy")[0],
  },
  donkeys: {
    name: "Donkeys",
    icon: getAmbassadorImages("jalapeno")[0],
  },
  parrots: {
    name: "Parrots",
    icon: getAmbassadorImages("siren")[0],
  },
  chickens: {
    name: "Chickens",
    icon: getAmbassadorImages("oliver")[0],
  },
};

const Check = ({ check }: { check: Check }) => {
  return (
    <div className="flex items-center gap-2 drop-shadow-md">
      <Image
        src={check.icon.src}
        alt={check.icon.alt}
        className="rounded-full border-2 border-white size-16 object-cover"
        style={{ objectPosition: check.icon.position }}
      />
      <span className="w-3 h-1.5 bg-white rounded-xs" />
      <span className="text-3xl font-bold text-white">{check.name}</span>
    </div>
  );
};

const RoundsPage: NextPage = () => {
  return (
    <div className="h-screen w-full">
      <div className="flex flex-col h-full justify-between items-start py-24 px-16">
        {Object.entries(checks).map(([key, check]) => (
          <Check key={key} check={check} />
        ))}
      </div>
    </div>
  );
};

export default RoundsPage;

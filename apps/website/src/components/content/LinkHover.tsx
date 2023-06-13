"use client";
import React, { useState } from "react";
import enclosures, { type EnclosureKey } from "@alveusgg/data/src/enclosures";
import type {
  Ambassador,
  AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import { kebabToCamel, sentenceToKebab } from "@/utils/string-case";
import { staff } from "@/pages/about/staff";
import ProfileCard from "./ProfileCard";
import Link from "./Link";

type LinkHoverProps = {
  species?: Ambassador["species"];
  enclosure?: EnclosureKey | undefined;
  href: string;
  name: string;
};

const nameToCamelCase = (name: string) => {
  const noSymbols = name.replace(/[{(/.)}]/g, "");
  const camelCased = noSymbols.replace("ñ", "n");
  return kebabToCamel(sentenceToKebab(camelCased));
};

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  name,
  species,
  enclosure,
}) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<number | null>(null);

  const camelName = nameToCamelCase(name);
  const img = getAmbassadorImages(camelName as AmbassadorKey)[0];
  console.log(typeof staff.connor.image);

  const enclosureName = enclosures[enclosure as EnclosureKey].name;

  const onEnter = () => {
    setDelay(
      window.setTimeout(() => {
        setCardShown(true);
      }, 500)
    );
  };
  const onLeave = () => {
    setCardShown(false);
    if (delay) window.clearTimeout(delay);
  };
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="inline">
      <Link href={href}>{name}</Link>
      {cardShown && (
        <ProfileCard
          name={name}
          img={img}
          species={species}
          enclosure={enclosureName}
        />
      )}
    </div>
  );
};

export default LinkHover;

import React from "react";

import ambassadors, {
  type Ambassador,
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import enclosures, { type EnclosureKey } from "@alveusgg/data/src/enclosures";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import type { AmbassadorImage } from "@alveusgg/data/src/ambassadors/images";
import { getAmbassadorImages } from "@alveusgg/data/src/ambassadors/images";
import { kebabToCamel, sentenceToKebab } from "@/utils/string-case";

import { staff } from "@/pages/about/staff";
import mayaImage from "@/assets/maya.png";

import Heading from "./Heading";

export type StaffImage = StaticImageData & {
  alt: string;
};
type StaffMember = {
  name: string;
  title: string;
  img: ImageProps | StaffImage;
  description?: JSX.Element;
};

type Staff = Array<StaffMember>;

export type ProfileCardProps = {
  ambassador?: AmbassadorKey;
  staffMember?: string;
  cardType: "ambassador" | "staff" | "enclosure";
  linkPosition: DOMRect | undefined;
  isEnclosure?: boolean;
};

const allStaff: Staff = Object.values(staff).map((person) => ({
  img: { ...person.image, alt: `${person.name}'s picture` },
  name: person.name,
  title: person.title,
  description: person.description,
}));

allStaff.push({
  img: { ...mayaImage, alt: "Maya's picture" },
  name: "Maya Higa",
  title: "Founder",
});

const nameToCamelCase = (name: string) => {
  const noSymbols = name.replace(/[{(/.)}]/g, "");
  const camelCased = noSymbols.replace("ñ", "n");
  return kebabToCamel(sentenceToKebab(camelCased));
};

const findMember = (name: string | undefined, members: Staff) => {
  const member = members.find(
    (person) => name && nameToCamelCase(name) == nameToCamelCase(person.name)
  );
  return member;
};
const calcDistance = (position: DOMRect) => {
  const elemPosition = position;
  const vwHeight = window.innerHeight;

  const bottom = vwHeight - elemPosition.bottom;
  const top = elemPosition.top;

  return top > bottom;
};

type SpanProps = {
  title: string;
  name?: Ambassador["species"] | undefined;
};

const Span: React.FC<SpanProps> = ({ title, name }) => {
  return (
    <div className="inline text-yellow-300">
      <span className="font-semibold">{title}:</span> {name}
    </div>
  );
};

// const enclosureName = species && enclosures[enclosure].name;
// const inhabiting = isEnclosure
//     ? Object.entries(ambassadors).filter(
//         (ambassador) => ambassador[1].enclosure === enclosure
//       )
// : [];

const staffStyle = `absolute z-50 flex flex-col lg:flex-row  box-border  max-w-[448px] gap-4 items-center rounded bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const ambassadorStyle = `absolute z-50 flex flex-col xl:flex-row  -translate-x-1/4 -mt-[25px] items-center gap-4 max-w-[340px]  rounded  bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

// const enclosureStyle = `absolute z-50 flex flex-col -translate-x-1/4 -mt-[25px] items-center gap-4  rounded  bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const ProfileCard: React.FC<ProfileCardProps> = ({
  ambassador,
  cardType,
  staffMember,
  linkPosition,
}) => {
  const ambassadorInfo = ambassador && ambassadors[ambassador];
  const staffMemberInfo = findMember(staffMember, allStaff);

  const name =
    cardType === "ambassador" ? ambassadorInfo?.name : staffMemberInfo?.name;

  const species = cardType === "ambassador" ? ambassadorInfo?.species : "";
  const position = cardType === "staff" ? staffMemberInfo?.title : "";

  const enclosure =
    cardType === "ambassador"
      ? ambassadorInfo && enclosures[ambassadorInfo.enclosure].name
      : "";

  const img =
    cardType === "ambassador"
      ? getAmbassadorImages(ambassador as AmbassadorKey)[0]
      : findMember(name, allStaff)?.img;

  const upwards = linkPosition && calcDistance(linkPosition);

  if (cardType === "staff") console.log(staffMemberInfo);

  const ambassadorStyles = `${ambassadorStyle} ${
    upwards ? "-translate-y-full" : "mt-4"
  } `;
  return (
    <>
      {cardType === "ambassador" && (
        <div className={ambassadorStyles}>
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              width="176"
              height="176"
              className={`${"h-28 w-auto rounded xl:h-24 xl:w-24 xl:rounded-full"}`}
            />
          )}
          <div className="flex flex-col text-sm">
            <Heading className="inline text-xl text-yellow-500" level={5}>
              {name}
            </Heading>
            <Span title="Species" name={species} />
            <Span title="Enclosure" name={enclosure} />
          </div>
        </div>
      )}
      {cardType === "staff" && (
        <div className={staffStyle}>
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              width="176"
              height="176"
              className={`${"h-28 w-auto rounded xl:h-28 xl:w-auto"}`}
            />
          )}
          <div className="flex flex-col text-sm">
            <Heading className="inline text-xl text-yellow-500" level={5}>
              {staffMember}
            </Heading>
            <Span title="Position" name={position} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;

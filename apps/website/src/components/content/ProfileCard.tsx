"use client";
import React from "react";
import type { Ambassador } from "@alveusgg/data/src/ambassadors/core";
import Image, { type ImageProps } from "next/image";
import type { AmbassadorImage } from "@alveusgg/data/src/ambassadors/images";
import type { StaffImage } from "./LinkHover";
import Heading from "./Heading";

export type ProfileCardProps = {
  name: string;
  position?: string;
  species?: Ambassador["species"];
  img?: AmbassadorImage | ImageProps | StaffImage;
  imgs?: false | AmbassadorImage[];
  enclosure?: string;
  isEnclosure?: boolean;
  upwards: boolean;
};

type SpanProps = {
  title: string;
  titleName?: Ambassador["species"] | string;
};

const Span: React.FC<SpanProps> = ({ title, titleName }) => {
  return (
    <div className="inline text-yellow-300">
      <span className="font-semibold">{title}:</span> {titleName}
    </div>
  );
};

const staffStyle = `absolute z-50 flex flex-col lg:flex-row  box-border  max-w-[448px] gap-4 items-center rounded bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const ambassadorStyle = `absolute z-50 flex flex-col xl:flex-row  -translate-x-1/4 -mt-[25px] items-center gap-4  rounded  bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const enclosureStyle = `absolute z-50 flex flex-col -translate-x-1/4 -mt-[25px] items-center gap-4  rounded  bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  img,
  imgs,
  species,
  enclosure,
  isEnclosure,
  position,
  upwards,
}) => {
  const ambassadorStyles = `${ambassadorStyle} ${
    upwards ? "-translate-y-full" : "mt-4"
  } `;
  return (
    <>
      {!isEnclosure && (
        <div
          className={
            position
              ? `${staffStyle} ${upwards ? "-translate-y-full" : "mt-5"} `
              : ambassadorStyles
          }
        >
          {img && (
            <Image
              src={img.src}
              alt={img.alt}
              width="176"
              height="176"
              className={`${
                position
                  ? "h-40 w-auto"
                  : "h-28 w-auto rounded xl:h-24 xl:w-24 xl:rounded-full"
              }`}
            />
          )}
          <div className="flex flex-col text-sm">
            <Heading className="inline text-xl text-yellow-500" level={5}>
              {name}
            </Heading>
            {species ? (
              <Span title="Species" titleName={species} />
            ) : (
              <Span title="Position" titleName={position} />
            )}
            {enclosure && (
              <div className="inline text-yellow-300">
                <span className="font-semibold">Enclosure:</span> {enclosure}
              </div>
            )}
          </div>
        </div>
      )}
      {isEnclosure && (
        <div
          className={`${enclosureStyle} ${
            upwards ? "mt-1 -translate-y-full" : "mt-6"
          }`}
        >
          <Span title={`Inhabitants (${imgs && imgs.length})`} />
          <div className="flex max-w-[210px] flex-row flex-wrap items-center justify-center">
            {imgs &&
              imgs
                .slice(0, 4)
                .map((img, id) => (
                  <Image
                    key={id}
                    src={img.src}
                    alt={img.alt}
                    width={176}
                    height={176}
                    className="m-1 h-24 w-24 rounded border border-yellow-300  object-cover"
                  />
                ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;

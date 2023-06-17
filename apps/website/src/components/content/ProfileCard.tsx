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
  enclosure?: string;
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

const staffStyle = `absolute z-20 flex flex-col lg:flex-row lg:-mt-[240px] -mt-[330px] border border-yellow-400 box-border  max-w-[448px] gap-4 items-center rounded bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800`;

const ambassadorStyle =
  "absolute z-50 flex max-w-[448px] -mt-[168px] items-center gap-6 rounded border border-yellow-500 bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800";

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  img,
  species,
  enclosure,
  position,
}) => {
  return (
    <div className={position ? staffStyle : ambassadorStyle}>
      {img && (
        <Image
          src={img.src}
          alt={img.alt}
          width="176"
          height="176"
          className={`${position ? "h-44 w-auto" : "h-24 w-24 rounded-full"}`}
        />
      )}
      <div className="flex flex-col">
        <Heading className="inline text-2xl text-yellow-500" level={4}>
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
  );
};

export default ProfileCard;

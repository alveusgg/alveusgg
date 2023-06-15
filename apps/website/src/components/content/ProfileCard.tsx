"use client";
import React from "react";
import type { Ambassador } from "@alveusgg/data/src/ambassadors/core";
import Image, { type StaticImageData, type ImageProps } from "next/image";
import type { AmbassadorImage } from "@alveusgg/data/src/ambassadors/images";
import Heading from "./Heading";

export type ProfileCardProps = {
  name: string;
  position?: string;
  species?: Ambassador["species"];
  img: AmbassadorImage | ImageProps;
  enclosure?: string;
};

type SpanProps = {
  title: string;
  titleName: Ambassador["species"] | string | undefined;
};

const Span: React.FC<SpanProps> = ({ title, titleName }) => {
  return (
    <div className="inline text-yellow-300">
      <span className="font-semibold">{title}:</span> {titleName}
    </div>
  );
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  img,
  species,
  enclosure,
  position,
}) => {
  return (
    <div className="absolute z-10 flex min-w-[320px] max-w-[448px] gap-6 rounded bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800">
      {/* Hard crear un Image obj dentro de staff Member? */}
      {<Image src={img.src} alt={img.alt} className="h-24 w-24 rounded-full" />}

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

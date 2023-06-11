"use client";
import React from "react";
import type { Ambassador } from "@alveusgg/data/src/ambassadors/core";
import Image from "next/image";
import type { AmbassadorImage } from "@alveusgg/data/src/ambassadors/images";
import Heading from "./Heading";

type ProfileCardProps = {
  name: string;
  position?: string;
  species?: Ambassador["species"];
  img?: AmbassadorImage;
  enclosure?: string;
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  img,
  species,
  enclosure,
}) => {
  return (
    <div className="absolute z-10 flex min-w-[320px] max-w-[448px] gap-6 rounded bg-alveus-green-900 p-4 shadow-lg shadow-alveus-green-800">
      {img ? (
        <Image src={img.src} alt={img.alt} className="h-24 w-24 rounded-full" />
      ) : (
        ""
      )}
      <div className="flex flex-col">
        <Heading className="inline text-2xl text-yellow-500" level={4}>
          {name}
        </Heading>
        <span className="inline text-yellow-300">Species: {species}</span>
        <span className="inline text-yellow-300">Enclosure: {enclosure}</span>
      </div>
    </div>
  );
};

export default ProfileCard;

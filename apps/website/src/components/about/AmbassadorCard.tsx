import Image from "next/image";
import React from "react";
import { type Ambassador } from "../../utils/data";

export function AmbassadorCard({ ambassador }: { ambassador: Ambassador }) {
  const mainImage = ambassador.images?.[0];

  return (
    <a
      href={ambassador.links?.website || "#"}
      target="_blank"
      rel="noreferrer"
      className="group/card flex w-[160px] flex-shrink-0 flex-col overflow-hidden rounded-xl bg-alveus-green shadow-xl transition-transform hover:scale-110 lg:w-[200px]"
    >
      {mainImage && (
        <Image
          className="aspect-square w-full object-cover transition-opacity"
          width={300}
          height={300}
          src={mainImage.url}
          alt={mainImage.alt || ""}
        />
      )}

      <div className="flex flex-col justify-end overflow-auto p-2 leading-tight text-white">
        <h3 className="text-bold mb-1 font-serif text-xl">{ambassador.name}</h3>
        <p className="text-bold font-sans text-base leading-tight text-gray-400">
          {ambassador.species}
        </p>
      </div>
    </a>
  );
}

import Image from "next/image";
import React from "react";
import { type Ambassador } from "../../utils/data";

export const AmbassadorCard: React.FC<{
  layout?: "small" | "full";
  ambassador: Ambassador;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}> = ({ layout = "full", ambassador, onClick }) => {
  const mainImage = ambassador.images?.[0];

  return (
    <a
      href={ambassador.links?.website || "#"}
      target="_blank"
      rel="noreferrer"
      className="group/card flex h-full w-full flex-shrink-0 flex-col overflow-hidden rounded-xl bg-alveus-green shadow-lg transition-transform hover:scale-110"
      onClick={onClick}
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
        {layout === "full" && (
          <p className="text-bold font-sans text-base leading-tight text-gray-400">
            {ambassador.species}
          </p>
        )}
      </div>
    </a>
  );
};

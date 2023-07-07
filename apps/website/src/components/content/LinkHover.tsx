import React, { useState } from "react";
import { type AmbassadorKey } from "@alveusgg/data/src/ambassadors/core";
import { type EnclosureKey } from "@alveusgg/data/src/enclosures";

import DynamicCard from "./DynamicCard";

import Link from "./Link";

type LinkHoverProps = {
  href: string;
  name: string;
  ambassador?: AmbassadorKey;
  enclosure?: EnclosureKey;
  staffMember?: string;
  cardType: "ambassador" | "staff" | "enclosure";
  yellow?: boolean;
};

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  name,
  ambassador,
  enclosure,
  yellow,
  cardType,
}) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<number | null>(null);
  const [linkPosition, setLinkPosition] = useState<DOMRect | undefined>();

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setLinkPosition(e.currentTarget.getBoundingClientRect());
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
      {cardShown && (
        <DynamicCard
          cardType={cardType}
          linkPosition={linkPosition && linkPosition}
          ambassador={ambassador}
          enclosure={enclosure}
          staffMember={cardType === "staff" ? name : ""}
        />
      )}
      <Link className={yellow ? "text-yellow-400" : ""} href={href}>
        {name}
      </Link>
    </div>
  );
};

export default LinkHover;

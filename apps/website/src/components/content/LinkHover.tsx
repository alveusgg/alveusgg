import React, { useState } from "react";
import { type AmbassadorKey } from "@alveusgg/data/src/ambassadors/core";
import { type EnclosureKey } from "@alveusgg/data/src/enclosures";
import dynamic from "next/dynamic";

import Link from "./Link";

const DynamicCard = dynamic(() => import("./ProfileCard"), {
  ssr: false,
});

type LinkHoverProps = {
  href: string;
  name: string;
  dark?: boolean;
  ambassador?: AmbassadorKey;
  enclosure?: EnclosureKey;
  staffMember?: string;
  cardType: "ambassador" | "staff" | "enclosure";
};

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  name,
  ambassador,
  enclosure,
  cardType,
  dark,
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
      <Link dark={dark && dark} href={href}>
        {name}
      </Link>
    </div>
  );
};

export default LinkHover;

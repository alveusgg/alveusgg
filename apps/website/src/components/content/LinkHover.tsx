import React, { useState, type ReactElement } from "react";
import enclosures, { type EnclosureKey } from "@alveusgg/data/src/enclosures";
import ambassadors, {
  type Ambassador,
  type AmbassadorKey,
} from "@alveusgg/data/src/ambassadors/core";
import ProfileCard from "./ProfileCard";

import Link from "./Link";

type LinkHoverProps = {
  href: string;
  name: string;
  ambassador?: AmbassadorKey;
  staffMember?: string;
  cardType: "ambassador" | "staff" | "enclosure";
};

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  name,
  ambassador,
  staffMember,
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
        <ProfileCard
          cardType={cardType}
          linkPosition={linkPosition && linkPosition}
          ambassador={ambassador}
          staffMember={cardType === "staff" ? name : ""}
        />
      )}

      <Link className={`text-yellow-400`} href={href}>
        {name}
      </Link>
    </div>
  );
};

export default LinkHover;

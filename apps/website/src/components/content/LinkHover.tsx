import React, { useState } from "react";
import { type AmbassadorKey } from "@alveusgg/data/src/ambassadors/core";
import { type EnclosureKey } from "@alveusgg/data/src/enclosures";
import dynamic from "next/dynamic";

import Link from "./Link";

const DynamicCard = dynamic(() => import("./ProfileCard"), {
  ssr: false,
});

type LinkHoverProps = {
  children: React.ReactNode;
  href: string;
  dark?: boolean;
} & (
  | { type: "ambassador"; key: AmbassadorKey }
  | { type: "enclosure"; key: EnclosureKey }
  | { type: "staff"; key: string }
);

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  children,
  type,
  key,
  dark,
}) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<NodeJS.Timeout | null>(null);
  const [linkPosition, setLinkPosition] = useState<DOMRect | undefined>();

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setLinkPosition(e.currentTarget.getBoundingClientRect());
    setDelay(
      setTimeout(() => {
        setCardShown(true);
      }, 500)
    );
  };
  const onLeave = () => {
    setCardShown(false);
    if (delay) clearTimeout(delay);
  };
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="inline">
      {cardShown && (
        <DynamicCard
          cardType={type}
          linkPosition={linkPosition && linkPosition}
          key={key}
        />
      )}
      <Link dark={dark && dark} href={href}>
        {children}
      </Link>
    </div>
  );
};

export default LinkHover;

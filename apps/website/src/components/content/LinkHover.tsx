import React, { useState, useCallback, useEffect } from "react";
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
  | { type: "ambassador"; itemKey: AmbassadorKey }
  | { type: "staff"; itemKey: string }
  | { type: "enclosure"; itemKey: EnclosureKey }
);

const LinkHover: React.FC<LinkHoverProps> = ({
  href,
  children,
  type,
  itemKey,
  dark,
}) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<NodeJS.Timeout | undefined>(undefined);
  const [linkPosition, setLinkPosition] = useState<DOMRect | undefined>();

  useEffect(() => {
    return () => clearTimeout(delay);
  }, [delay]);

  const onEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setLinkPosition(e.currentTarget.getBoundingClientRect());
    setDelay(
      setTimeout(() => {
        setCardShown(true);
      }, 500)
    );
  }, []);

  const onLeave = useCallback(() => {
    setCardShown(false);
    if (delay) clearTimeout(delay);
  }, [delay]);

  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} className="inline">
      {cardShown && (
        <DynamicCard
          type={type}
          linkPosition={linkPosition && linkPosition}
          itemKey={itemKey}
        />
      )}
      <Link dark={dark && dark} href={href}>
        {children}
      </Link>
    </div>
  );
};

export default LinkHover;

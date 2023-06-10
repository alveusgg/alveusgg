"use client";

import React, { useState } from "react";
import Link from "./Link";

type LinkHoverProps = {
  children?: never[] | string;
  href: string;
  name: string;
};

const LinkHover: React.FC<LinkHoverProps> = ({ href, name }) => {
  const [cardShown, setCardShown] = useState<boolean>(false);
  const [delay, setDelay] = useState<number | null>(null);

  const onEnter = () => {
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
      <Link href={href}>{name}</Link>
      {cardShown && <span>This would be {name}&apos;s card </span>}
    </div>
  );
};

export default LinkHover;

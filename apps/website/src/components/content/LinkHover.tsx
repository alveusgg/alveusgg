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
  const [delay, setDelay] = useState<any | null>(null);

  const onEnter = () => {
    setDelay(
      setTimeout(() => {
        setCardShown(true);
      }, 500)
    );
  };
  const onLeave = () => {
    setCardShown(false);
    clearTimeout(delay);
  };
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link href={href}>{name}</Link>
      {cardShown && <span>This would be {name}&apos;s card </span>}
    </div>
  );
};

export default LinkHover;

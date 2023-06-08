"use client";

import Link from "next/link";
import React, { useState } from "react";

type LinkHoverProps = {
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
        console.log("showing card lol");
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
      {cardShown && <span>This would be the card</span>}
    </div>
  );
};

export default LinkHover;

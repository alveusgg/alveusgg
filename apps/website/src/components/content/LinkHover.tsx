import Link from "next/link";

import React from "react";

type LinkHoverProps = {
  href: string;
  name: string;
};

const LinkHover: React.FC<LinkHoverProps> = ({ href, name }) => {
  return (
    <div>
      <Link href={href}>{name}</Link>
    </div>
  );
};

export default LinkHover;

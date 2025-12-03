import Image from "next/image";
import { type HTMLProps, useMemo } from "react";

import { classes } from "@/utils/classes";
import { getShortBaseUrl } from "@/utils/short-url";

import { QRCode } from "@/components/QrCode";
import Cycle from "@/components/overlay/Cycle";

import logoImage from "@/assets/logo.png";

const Socials = ({
  interval,
  className,
  ...props
}: { interval: number } & HTMLProps<HTMLDivElement>) => (
  <div className={classes(className, "flex items-center gap-2")} {...props}>
    <div className="relative size-16">
      <Cycle
        items={useMemo(
          () => [
            <Image
              key="logo"
              src={logoImage}
              alt=""
              height={64}
              className="object-contain opacity-75 brightness-150 contrast-125 drop-shadow-sm grayscale"
            />,
            <QRCode
              key="qr"
              className="rounded-lg border-2 border-black/75 bg-white p-0.5 opacity-90 drop-shadow-sm"
              value={`${getShortBaseUrl()}/socials`}
            />,
          ],
          [],
        )}
        interval={interval}
        className="absolute inset-0"
      />
    </div>

    <div className="text-xl font-bold text-white text-stroke">
      <p>alveussanctuary.org</p>
      <p>@alveussanctuary</p>
    </div>
  </div>
);

export default Socials;

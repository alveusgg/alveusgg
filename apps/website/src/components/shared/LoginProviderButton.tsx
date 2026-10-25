import { Google_Sans } from "next/font/google";
import Image from "next/image";
import type { ComponentProps } from "react";

import type { LoginProvider } from "@/data/auth";

import { classes } from "@/utils/classes";

import { Button } from "@/components/shared/form/Button";

import IconDiscord from "@/icons/IconDiscord";
import IconTwitch from "@/icons/IconTwitch";

import googleLogo from "@/assets/auth/google.png";

const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: "500",
  adjustFontFallback: false,
});

// https://developers.google.com/identity/branding-guidelines
// https://discord.com/branding
const providerClasses = {
  twitch:
    "border-transparent bg-[#9146ff] text-white enabled:hover:bg-[#772ce8]",
  google:
    "border-[#747775] bg-white text-sm text-[#1f1f1f] enabled:hover:bg-[#f8faff]",
  discord:
    "border-transparent bg-[#5865f2] text-white enabled:hover:bg-[#4752c4]",
} satisfies Record<LoginProvider, string>;

type Props = ComponentProps<typeof Button> & { provider: LoginProvider };

export default function LoginProviderButton({
  provider,
  children,
  className,
  style,
  ...props
}: Props) {
  return (
    <Button
      {...props}
      className={classes(
        "min-h-12 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-alveus-green-900",
        providerClasses[provider],
        className,
      )}
      style={provider === "google" ? { ...googleSans.style, ...style } : style}
    >
      {provider === "google" ? (
        <Image
          src={googleLogo}
          alt=""
          width={20}
          height={20}
          className="shrink-0"
        />
      ) : provider === "discord" ? (
        <IconDiscord size={20} className="shrink-0" aria-hidden="true" />
      ) : (
        <IconTwitch size={20} className="shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
    </Button>
  );
}

import type { IconProps } from "@/icons/BaseIcon";
import IconGift from "@/icons/IconGift";
import IconPayPal from "@/icons/IconPayPal";
import IconTwitch from "@/icons/IconTwitch";

function DonationProviderIcon({
  provider,
  ...iconProps
}: { provider: string } & IconProps) {
  switch (provider) {
    case "twitch":
      return <IconTwitch {...iconProps} />;
    case "paypal":
      return <IconPayPal {...iconProps} />;
    default:
      return <IconGift {...iconProps} />;
  }
}

export default DonationProviderIcon;

import { PIXEL_TOTAL } from "@/data/murals";

import { usePixels } from "@/hooks/pixels";

import Consent from "@/components/Consent";
import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";
import NeonDonateEmbed from "@/components/content/NeonDonateEmbed";

function PixelsDonate({ className }: { className?: string }) {
  const pixels = usePixels();

  if (!pixels || pixels.length >= PIXEL_TOTAL) return null;

  return (
    <Consent item="donation widget" consent="neon">
      <Box dark className={className}>
        <Heading level={2} className="text-center text-xl">
          Unlock a Pixel on the Mural
        </Heading>

        <NeonDonateEmbed
          form="arri"
          className="-mx-8 -mb-8 *:w-full *:[&_iframe]:outline-none"
        />
      </Box>
    </Consent>
  );
}

export default PixelsDonate;

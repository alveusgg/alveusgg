import { env } from "@/env";

interface DonationEvent {
  title: string;
  description?: string;
  cta: string;
  link: string;
  external: boolean;
}

const donationEvent: DonationEvent | null =
  env.NEXT_PUBLIC_DONATION_EVENT_TITLE?.trim() &&
  env.NEXT_PUBLIC_DONATION_EVENT_CTA?.trim() &&
  env.NEXT_PUBLIC_DONATION_EVENT_LINK?.trim()
    ? {
        title: env.NEXT_PUBLIC_DONATION_EVENT_TITLE.trim(),
        description: env.NEXT_PUBLIC_DONATION_EVENT_DESCRIPTION?.trim(),
        cta: env.NEXT_PUBLIC_DONATION_EVENT_CTA.trim(),
        link: env.NEXT_PUBLIC_DONATION_EVENT_LINK.trim(),
        external: env.NEXT_PUBLIC_DONATION_EVENT_EXTERNAL,
      }
    : null;

export default donationEvent;

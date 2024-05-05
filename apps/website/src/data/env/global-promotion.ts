import { env } from "@/env";

interface GlobalPromotion {
  title: string;
  cta: string;
  link: string;
  external: boolean;
  excluded: string[];
}

const globalPromotion: GlobalPromotion | null =
  env.NEXT_PUBLIC_GLOBAL_PROMOTION_TITLE?.trim() &&
  env.NEXT_PUBLIC_GLOBAL_PROMOTION_CTA?.trim() &&
  env.NEXT_PUBLIC_GLOBAL_PROMOTION_LINK?.trim()
    ? {
        title: env.NEXT_PUBLIC_GLOBAL_PROMOTION_TITLE.trim(),
        cta: env.NEXT_PUBLIC_GLOBAL_PROMOTION_CTA.trim(),
        link: env.NEXT_PUBLIC_GLOBAL_PROMOTION_LINK.trim(),
        external: env.NEXT_PUBLIC_GLOBAL_PROMOTION_EXTERNAL,
        excluded: (env.NEXT_PUBLIC_GLOBAL_PROMOTION_EXCLUDED || "")
          .split(",")
          .reduce((acc, cur) => {
            const trimmed = cur.trim();
            return trimmed ? acc.push(trimmed) : acc;
          }, [] as string[]),
      }
    : null;

export default globalPromotion;

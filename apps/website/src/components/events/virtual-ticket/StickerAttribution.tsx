import { notEmpty, typeSafeObjectKeys } from "@/utils/helpers";
import { type StickerPack } from "@/utils/virtual-tickets";

import Link from "@/components/content/Link";

type StickerPackProps = {
  stickerPack: StickerPack;
};

export function StickerAttribution({ stickerPack }: StickerPackProps) {
  return (
    <>
      {typeSafeObjectKeys(stickerPack.groups)
        .map((groupId) => stickerPack.groups[groupId])
        .filter(notEmpty)
        .filter((group) => group.attribution)
        .map((group, index, groups) => {
          const last = groups.length - 1;
          return (
            <span key={index}>
              {index > 0 && index < last && ", "}
              {index > 0 && index === last && " and "}
              {group.attribution && group.attributionLink ? (
                <Link external href={group.attributionLink}>
                  {group.attribution}
                </Link>
              ) : (
                group.attribution || <>&nbsp;</>
              )}
            </span>
          );
        })}
    </>
  );
}

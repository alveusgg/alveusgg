import { typeSafeObjectKeys } from "@/utils/helpers";
import { classes } from "@/utils/classes";
import { mapStickerIdToPath, type StickerPack } from "@/utils/virtual-tickets";

import Link from "@/components/content/Link";

type StickerPackProps = {
  stickerPack: StickerPack;
  selectedStickers: string[];
  onSelect: (stickerId: string) => void;
};

export function StickerSelector({
  selectedStickers,
  onSelect,
  stickerPack,
}: StickerPackProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
      {typeSafeObjectKeys(stickerPack.groups).map((groupId) => {
        const group = stickerPack.groups[groupId]!;
        const attribution = group.attribution && `Art by ${group.attribution}`;

        return (
          <div key={groupId} className="flex-1">
            <div className="flex flex-row justify-center gap-1 text-sm leading-tight md:justify-start lg:flex-col lg:gap-0 lg:text-base">
              <h3 className="font-bold lg:text-lg">{group.name}</h3>
              <p className="text-gray-800">
                {group.description}
                {group.description && attribution && " - "}
                {attribution &&
                  (group.attributionLink ? (
                    <Link external href={group.attributionLink}>
                      {attribution}
                    </Link>
                  ) : (
                    attribution
                  ))}
                &nbsp;
              </p>
            </div>

            <ul className="flex w-full flex-row flex-wrap items-center gap-1 py-2 md:gap-2 lg:gap-3">
              {typeSafeObjectKeys(stickerPack.stickers)
                .filter(
                  (imageId) =>
                    groupId === stickerPack.stickers[imageId]!.groupId,
                )
                .map((imageId) => ({
                  name: stickerPack.stickers[imageId]!.name,
                  disabled: selectedStickers.includes(imageId),
                  image: mapStickerIdToPath(stickerPack.stickers, imageId),
                  imageId,
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(({ name, disabled, imageId, image }) => (
                  <li key={imageId} className="shrink-0">
                    <button
                      className="disabled select-none rounded-lg bg-white p-0.5 shadow-lg transition-transform enabled:hover:scale-110 disabled:bg-gray-300"
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) {
                          onSelect(imageId);
                        }
                      }}
                      title={`${disabled ? "" : "Add"} ${name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        className={classes(
                          "aspect-square h-[28px] w-[28px] lg:h-[40px] lg:w-[40px]",
                          disabled && "opacity-50 grayscale",
                        )}
                        width={40}
                        height={40}
                      />
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

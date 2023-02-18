import { CardSwiper } from "../shared/CardSwiper";
import { notEmpty } from "../../utils/helpers";
import type { Enclosures as EnclosuresData } from "../../server/utils/data";
import { EnclosureCard } from "./EnclosureCard";

export const Enclosures: React.FC<{
  enclosures: EnclosuresData;
  setSelectedEnclosureName: (name: string) => void;
}> = ({ enclosures, setSelectedEnclosureName }) => {
  const names = Object.keys(enclosures).filter(notEmpty);

  return (
    <>
      {enclosures && (
        <CardSwiper
          className="px-4"
          slideClasses="h-full w-[160px] lg:w-[200px] py-4"
          cards={names.map((name) => {
            const data = enclosures[name];
            return (
              data && (
                <EnclosureCard
                  key={name}
                  enclosure={data}
                  onClick={(e: React.MouseEvent) => {
                    if (e.metaKey || e.shiftKey) {
                      return;
                    }
                    e.preventDefault();
                    setSelectedEnclosureName(name);
                  }}
                />
              )
            );
          })}
        />
      )}
    </>
  );
};

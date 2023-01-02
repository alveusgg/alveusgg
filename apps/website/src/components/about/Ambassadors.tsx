import { CardSwiper } from "../shared/CardSwiper";
import { notEmpty } from "../../utils/helpers";
import type { Ambassadors as AmbassadorsData } from "../../utils/data";
import { AmbassadorCard } from "./AmbassadorCard";

export const Ambassadors: React.FC<{
  ambassadors: AmbassadorsData;
  setSelectedAmbassadorName: (name: string) => void;
}> = ({ ambassadors, setSelectedAmbassadorName }) => {
  const names = Object.keys(ambassadors).filter(notEmpty);

  return (
    <>
      {ambassadors && (
        <CardSwiper
          className="px-4"
          slideClasses="h-full w-[160px] lg:w-[200px] py-4"
          cards={names.map((name) => {
            const data = ambassadors[name];
            return (
              data && (
                <AmbassadorCard
                  key={name}
                  ambassador={data}
                  onClick={(e: React.MouseEvent) => {
                    if (e.metaKey || e.shiftKey) {
                      return;
                    }
                    e.preventDefault();
                    setSelectedAmbassadorName(name);
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

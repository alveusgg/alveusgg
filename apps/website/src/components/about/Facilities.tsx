import { CardSwiper } from "../shared/CardSwiper";
import { notEmpty } from "../../utils/helpers";
import type { Facilities as FacilitiesData } from "../../utils/data";
import { FacilityCard } from "./FacilityCard";

export const Facilities: React.FC<{
  facilities: FacilitiesData;
  setSelectedFacilityName: (name: string) => void;
}> = ({ facilities, setSelectedFacilityName }) => {
  const names = Object.keys(facilities).filter(notEmpty);

  return (
    <>
      {facilities && (
        <CardSwiper
          className="px-4"
          slideClasses="h-full w-[160px] lg:w-[200px] py-4"
          cards={names.map((name) => {
            const data = facilities[name];
            return (
              data && (
                <FacilityCard
                  key={name}
                  facility={data}
                  onClick={(e: React.MouseEvent) => {
                    if (e.metaKey || e.shiftKey) {
                      return;
                    }
                    e.preventDefault();
                    setSelectedFacilityName(name);
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

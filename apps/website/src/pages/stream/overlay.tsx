import { type NextPage } from "next";

import Event from "@/components/overlay/Event";
import Weather from "@/components/overlay/Weather";
import Timecode from "@/components/overlay/Timecode";
import Datetime from "@/components/overlay/Datetime";

const OverlayPage: NextPage = () => {
  return (
    <div className="h-screen w-full">
      <Datetime className="absolute right-2 top-2 text-right">
        <Weather />
      </Datetime>

      <Event className="absolute bottom-2 left-2" />

      <Timecode className="absolute bottom-0 right-0" />
    </div>
  );
};

export default OverlayPage;

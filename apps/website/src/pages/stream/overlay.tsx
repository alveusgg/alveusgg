import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

import Event from "@/components/overlay/Event";
import Weather from "@/components/overlay/Weather";
import Timecode from "@/components/overlay/Timecode";
import Datetime from "@/components/overlay/Datetime";

const OverlayPage: NextPage = () => {
  // Allow the hide query parameter to hide components
  const { query } = useRouter();
  const hide = useMemo(
    () =>
      new Set(
        query.hide
          ? Array.isArray(query.hide)
            ? query.hide
            : [query.hide]
          : [],
      ),
    [query.hide],
  );

  return (
    <div className="h-screen w-full">
      {!hide.has("datetime") && (
        <Datetime className="absolute right-2 top-2 text-right">
          {!hide.has("weather") && <Weather />}
        </Datetime>
      )}

      {!hide.has("event") && <Event className="absolute bottom-2 left-2" />}

      {!hide.has("timecode") && (
        <Timecode className="absolute bottom-0 right-0" />
      )}
    </div>
  );
};

export default OverlayPage;

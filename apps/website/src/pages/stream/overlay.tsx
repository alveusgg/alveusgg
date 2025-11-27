import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { queryArray } from "@/utils/array";

import Datetime from "@/components/overlay/Datetime";
import Event from "@/components/overlay/Event";
import Subs from "@/components/overlay/Subs";
import Timecode from "@/components/overlay/Timecode";
import Weather from "@/components/overlay/Weather";

const OverlayPage: NextPage = () => {
  // Allow the hide query parameter to hide components
  const { query } = useRouter();
  const hide = useMemo(() => new Set(queryArray(query.hide)), [query.hide]);

  return (
    <div className="h-screen w-full">
      {!hide.has("datetime") && (
        <Datetime className="absolute top-2 right-2 text-right">
          {!hide.has("weather") && <Weather />}
        </Datetime>
      )}

      {!hide.has("event") && <Event className="absolute bottom-2 left-2" />}

      {!hide.has("subs") && (
        <Subs className="absolute right-2 bottom-2 text-right" />
      )}

      {!hide.has("timecode") && (
        <Timecode className="absolute right-0 bottom-0" />
      )}
    </div>
  );
};

export default OverlayPage;

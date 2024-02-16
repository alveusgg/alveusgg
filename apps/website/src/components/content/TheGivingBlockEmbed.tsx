import Script from "next/script";
import { useEffect } from "react";

import { theGivingBlockConfig } from "@/data/the-giving-block";

const TheGivingBlockEmbed = () => {
  useEffect(() => {
    window.tgbWidgetOptions = theGivingBlockConfig;
  }, []);

  return (
    <div className="inline-block [&>*]:max-w-full">
      <div id="tgb-widget-script"></div>
      <Script
        src="https://widget.thegivingblock.com/widget/script.js"
        async={true}
      ></Script>
    </div>
  );
};

export default TheGivingBlockEmbed;

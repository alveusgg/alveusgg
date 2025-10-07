import { useEffect, useId } from "react";

import { theGivingBlockConfig } from "@/data/the-giving-block";

const TheGivingBlockEmbed = () => {
  const id = useId();

  useEffect(() => {
    Reflect.deleteProperty(window, "widgetOptions");
    Reflect.deleteProperty(window, "tgbWidgetOptions");
    window.tgbWidgetOptions = theGivingBlockConfig;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://widget.thegivingblock.com/widget/script.js#${id}`;
    document.body.appendChild(script);

    return () => script.remove();
  }, [id]);

  return <div id="tgb-widget-script" />;
};

export default TheGivingBlockEmbed;

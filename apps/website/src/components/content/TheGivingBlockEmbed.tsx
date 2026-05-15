import { useEffect, useId, useRef } from "react";

import {
  type TheGivingBlockConfig,
  theGivingBlockConfig,
} from "@/data/the-giving-block";

const TheGivingBlockEmbed = ({
  className,
  ...props
}: { className?: string } & Partial<TheGivingBlockConfig>) => {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = ref.current;
    if (!div) return;

    // Create a new injection target for the widget
    const target = document.createElement("div");
    target.id = `tgb-widget-${id}`;
    div.appendChild(target);

    // Set global options for the widget
    Reflect.deleteProperty(window, "widgetOptions");
    Reflect.deleteProperty(window, "tgbWidgetOptions");
    window.tgbWidgetOptions = {
      ...theGivingBlockConfig,
      ...props,
      scriptId: `tgb-widget-${id}`,
    };

    // Inject the script to load the widget
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://widget.thegivingblock.com/widget/script.js#${id}`;
    div.appendChild(script);

    return () => {
      div.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, JSON.stringify(props)]);

  // Reserve the widget's final rendered height up-front to avoid layout shift
  // once the widget script finishes loading.
  return <div ref={ref} className={`min-h-[820px] ${className ?? ""}`} />;
};

export default TheGivingBlockEmbed;

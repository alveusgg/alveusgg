import { useEffect, useRef } from "react";

// This script attempts to call document.write(), which we block in _app.tsx to prevent React issues
const WIDGET_ID = "neon-form-embed-4-container";
const WIDGET_URL =
  "https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ=";

const getOrCreateHidden = () => {
  let hiddenNode = document.getElementById(`${WIDGET_ID}-hidden`);

  if (!hiddenNode) {
    hiddenNode = document.createElement("div");
    hiddenNode.style.display = "none";
    hiddenNode.id = `${WIDGET_ID}-hidden`;
  }

  return hiddenNode;
};

const getOrCreateWidget = () => {
  let widgetNode = document.getElementById(WIDGET_ID);
  let scriptNode = null;

  if (!widgetNode) {
    widgetNode = document.createElement("div");
    widgetNode.id = WIDGET_ID;

    scriptNode = document.createElement("script");
    scriptNode.src = WIDGET_URL;
    scriptNode.async = true;
  }

  return [widgetNode, scriptNode] as const;
};

const NeonDonateEmbed = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the widget, or restore it from the hidden DOM element if it has already been created
    const [widgetNode, scriptNode] = getOrCreateWidget();
    container.appendChild(widgetNode);
    if (scriptNode) document.body.appendChild(scriptNode);

    // When unmounting, store the widget in a hidden DOM element outside React's control to preserve it
    return () => {
      const hiddenNode = getOrCreateHidden();
      document.body.appendChild(hiddenNode);
      hiddenNode.appendChild(widgetNode);
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

export default NeonDonateEmbed;

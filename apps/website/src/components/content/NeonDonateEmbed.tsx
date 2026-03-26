import { useEffect, useRef } from "react";

const WIDGET_ID = "neon-form-embed-4-container";
const WIDGET_URL =
  "https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ=";

function getOrCreateParkingLot() {
  let parkingLot = document.getElementById(`${WIDGET_ID}-parking-lot`);
  if (!parkingLot) {
    parkingLot = document.createElement("div");
    parkingLot.style.display = "none";
    parkingLot.id = `${WIDGET_ID}-parking-lot`;
    document.body.appendChild(parkingLot);
  }
  return parkingLot;
}

function getOrLoadWidget() {
  let widgetNode = document.getElementById(WIDGET_ID);
  if (!widgetNode) {
    widgetNode = document.createElement("div");
    widgetNode.id = WIDGET_ID;

    const script = document.createElement("script");
    script.src = WIDGET_URL;
    document.body.appendChild(script);
  }

  return widgetNode;
}

const NeonDonateEmbed = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const widgetNode = getOrLoadWidget();
    container.appendChild(widgetNode);

    return () => {
      getOrCreateParkingLot().appendChild(widgetNode);
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

export default NeonDonateEmbed;

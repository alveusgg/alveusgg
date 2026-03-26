import { useEffect, useRef } from "react";

const NeonDonateEmbed = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let widgetNode = document.getElementById("neon-form-embed-4-container");
    if (widgetNode) {
      container.appendChild(widgetNode);
    } else {
      widgetNode = document.createElement("div");
      widgetNode.id = "neon-form-embed-4-container";
      container.appendChild(widgetNode);

      const script = document.createElement("script");
      script.src =
        "https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ=";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // move the widget to the parking lot node outside the React app
      let parkingLot = document.getElementById("neon-parking-lot");
      if (!parkingLot) {
        parkingLot = document.createElement("div");
        parkingLot.style.display = "none";
        parkingLot.id = "neon-parking-lot";
        document.body.appendChild(parkingLot);
      }

      if (widgetNode && parkingLot) {
        parkingLot.appendChild(widgetNode);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

export default NeonDonateEmbed;

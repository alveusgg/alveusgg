import { useEffect } from "react";

const NeonDonateEmbed = ({ className }: { className?: string }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ=";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return <div className={className} id="neon-form-embed-4-container" />;
};

export default NeonDonateEmbed;

import { useEffect, useRef } from "react";

interface FormSettings {
  id: string;
  src: string;
}

const forms = {
  general: {
    id: "neon-form-embed-4-container",
    src: "https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ=",
  },
} as const satisfies Record<string, FormSettings>;

type Form = keyof typeof forms;

const getOrCreateHidden = (id: string) => {
  let hiddenNode = document.getElementById(`${id}-hidden`);

  if (!hiddenNode) {
    hiddenNode = document.createElement("div");
    hiddenNode.style.display = "none";
    hiddenNode.id = `${id}-hidden`;
  }

  return hiddenNode;
};

const getOrCreateWidget = (id: string, src: string) => {
  let widgetNode = document.getElementById(id);
  let scriptNode = null;

  if (!widgetNode) {
    widgetNode = document.createElement("div");
    widgetNode.id = id;

    // This script attempts to call document.write(), which we block in _app.tsx to prevent React issues
    scriptNode = document.createElement("script");
    scriptNode.src = src;
    scriptNode.async = true;
  }

  return [widgetNode, scriptNode] as const;
};

const NeonDonateEmbed = ({
  form,
  className,
}: {
  form: Form;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { id, src } = forms[form];

    // Create the widget, or restore it from the hidden DOM element if it has already been created
    const [widgetNode, scriptNode] = getOrCreateWidget(id, src);
    container.appendChild(widgetNode);
    if (scriptNode) document.body.appendChild(scriptNode);

    // When unmounting, store the widget in a hidden DOM element outside React's control to preserve it
    return () => {
      const hiddenNode = getOrCreateHidden(id);
      document.body.appendChild(hiddenNode);
      hiddenNode.appendChild(widgetNode);
    };
  }, [form]);

  return <div ref={containerRef} className={className} />;
};

export default NeonDonateEmbed;

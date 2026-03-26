import { useEffect, useId, useRef } from "react";

const srcDoc = (id: string) => `
<html>
<body>
<style>
  html, body {
    background: transparent;
    margin: 0;
    padding: 0;
  }
</style>
<script>
  const observer = new MutationObserver((mutations) => {
    window.parent.postMessage({ type: "resize-${id}", height: document.body.scrollHeight }, "*");
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
</script>
<script src='https://alveussanctuary.app.neoncrm.com/forms/share/Rk9STS1FTUJFRFNIQVJJTkctQ09ERTQ='></script>
</body>
</html>
`;

const NeonDonateEmbed = ({ className }: { className?: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const id = useId();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === `resize-${id}` && ref.current) {
        ref.current.style.height = `${event.data.height}px`;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);

  return <iframe ref={ref} srcDoc={srcDoc(id)} className={className} />;
};

export default NeonDonateEmbed;

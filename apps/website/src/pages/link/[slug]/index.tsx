import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const s = router.query["slug"];
    if (typeof s === "string") {
      const slug = s;
      if (router.isReady && slug) {
        switch (slug) {
          case "maya":
            router.push("/about/maya");
            break;
          case "a":
            router.push("/ambassadors");
            break;
          case "twitch":
            router.push("https://twitch.tv/alveussanctuary");
            break;
          case "tw":
            router.push("https://twitch.tv/alveussanctuary");
            break;
        }
      }
    }
  }, [router.isReady]);
}

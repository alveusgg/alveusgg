import { useRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";

export default function Index() {
  const router = useRouter();

  const cache = trpc.adminShortLinks.getLinks.useQuery();

  useEffect(() => {
    const s = router.query["slug"];
    if (typeof s === "string") {
      const slug = s;
      if (router.isReady && slug && cache) {
        cache.data?.forEach((link) => {
          if (link.slug.toLowerCase() === slug) {
            console.log("Redirecting to " + slug);
            router.push(link.link);
          }
        });
      }
      router.push("/");
    }
  }, [router.isReady]);
  return (
    <>
      <p>Redirecting...</p>
    </>
  );
}

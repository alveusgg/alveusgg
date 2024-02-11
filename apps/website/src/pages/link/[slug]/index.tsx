import { useRouter, type NextRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { delay } from "@/utils/delay";

export default function Index() {
  const router = useRouter();

  const cache = trpc.adminShortLinks.getLinks.useQuery();
  const tracking = trpc.adminShortLinks.addClick.useMutation();

  useEffect(() => {
    const s = router.query["slug"];
    if (typeof s === "string") {
      const slug = s;
      if (router.isReady && slug && cache) {
        cache.data?.forEach((link) => {
          if (link.slug.toLowerCase() === slug) {
            router.push(link.link).then(() => tracking.mutate(link.id));
            return;
          }
        });
      }
      delay(1000).then(() => redirectHome(router));
    }
  }, [router.isReady]);
  return (
    <>
      <p>Redirecting...</p>
    </>
  );
}

async function redirectHome(router: NextRouter) {
  await router.push("/");
}

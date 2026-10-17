import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { trpc } from "@/utils/trpc";

export default function usePresetAccess() {
  const { data: session } = useSession();
  const identity = session?.user?.id ?? null;
  const previousIdentity = useRef(identity);
  const utils = trpc.useUtils();
  const access = trpc.presets.access.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  useEffect(() => {
    if (previousIdentity.current !== identity) {
      previousIdentity.current = identity;
      void utils.presets.access
        .cancel()
        .then(() => utils.presets.access.invalidate());
    }
  }, [identity, utils]);
  return access;
}

import { useSession } from "next-auth/react";

import { scopeGroups } from "@/data/twitch";

import { trpc } from "@/utils/trpc";

const useSubscriberAccess = (checkSubscription = true) => {
  const { data: session } = useSession();
  const hasScopes = scopeGroups.chat.every((scope) =>
    session?.user?.scopes?.includes(scope),
  );

  const subscription = trpc.stream.getSubscription.useQuery(undefined, {
    enabled: checkSubscription && hasScopes,
  });

  return { hasScopes, subscription };
};

export default useSubscriberAccess;

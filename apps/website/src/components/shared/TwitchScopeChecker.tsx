import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const TwitchScopeChecker = () => {
  const { data } = useSession();
  const twitch = data?.user?.twitch;

  useEffect(() => {
    if (twitch?.error || !twitch?.requiredScopes?.length) return;

    // Channel integrations share these credentials with ordinary Twitch logins.
    void signIn(
      "twitch",
      { callbackUrl: window.location.href },
      {
        scope: [...new Set([...twitch.scopes, ...twitch.requiredScopes])].join(
          " ",
        ),
      },
    );
  }, [twitch]);

  return null;
};

export default TwitchScopeChecker;

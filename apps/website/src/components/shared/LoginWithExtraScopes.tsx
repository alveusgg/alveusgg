import { signIn, useSession } from "next-auth/react";

import {
  type ScopeGroup,
  isScope,
  scopeGroups,
  scopeLabels,
} from "@/data/twitch";

import { classes } from "@/utils/classes";

import { Button } from "@/components/shared/form/Button";

import IconTwitch from "@/icons/IconTwitch";

const Scopes = ({ scopes }: { scopes: string[] }) => (
  <ul className="flex flex-wrap gap-2">
    {scopes.map((scope) => (
      <li
        key={scope}
        className="rounded-md bg-alveus-green px-1.5 py-0.5 text-sm/tight text-alveus-tan"
        title={scope}
      >
        {isScope(scope) ? scopeLabels[scope] : scope}
      </li>
    ))}
  </ul>
);

const LoginWithExtraScopes = ({
  scopeGroup,
  showCurrentScopes = false,
  showMissingScopes = true,
  className,
}: {
  scopeGroup: Exclude<ScopeGroup, "default">;
  showCurrentScopes?: boolean;
  showMissingScopes?: boolean;
  className?: string;
}) => {
  const { data, status } = useSession();

  const currentScopes = data?.user?.twitch?.scopes ?? [];
  const requiredScopes = [
    ...(data?.user?.twitch?.scopes ?? []),
    ...scopeGroups.default,
    ...scopeGroups[scopeGroup],
  ];
  const missingScopes = requiredScopes.filter(
    (scope) => !currentScopes.includes(scope),
  );
  if (!missingScopes.length && !data?.user?.twitch?.error && !showCurrentScopes)
    return null;

  return (
    <div className={classes("flex flex-col gap-4", className)}>
      {(!!missingScopes.length || data?.user?.twitch?.error) && (
        <Button
          className="bg-twitch text-white transition-[filter] hover:brightness-110"
          onClick={() =>
            signIn(
              "twitch",
              { callbackUrl: window.location.href },
              {
                scope: requiredScopes.join(" "),
              },
            )
          }
        >
          <IconTwitch />
          <span>
            {data?.user?.twitch ? "Reconnect Twitch" : "Connect Twitch"}
          </span>
        </Button>
      )}

      {showCurrentScopes && (
        <>
          {status === "loading" && (
            <p className="text-sm">Loading authentication status...</p>
          )}

          {status === "unauthenticated" && (
            <p className="text-sm">You&apos;re not authenticated currently.</p>
          )}

          {status === "authenticated" && data.user && (
            <div>
              <p className="mb-1 text-sm">
                You&apos;re currently authenticated with the following Twitch
                permissions:
              </p>
              <Scopes scopes={currentScopes} />
            </div>
          )}
        </>
      )}

      {showMissingScopes && !!missingScopes.length && (
        <div>
          <p className="mb-1 text-sm">
            Logging in with Twitch will grant us the following permissions:
          </p>
          <Scopes scopes={missingScopes} />
        </div>
      )}
    </div>
  );
};

export default LoginWithExtraScopes;

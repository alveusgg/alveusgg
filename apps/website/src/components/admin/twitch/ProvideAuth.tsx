import { signIn } from "next-auth/react";

import { botScopes, defaultScopes, isScope, scopeLabels } from "@/data/twitch";

import { trpc } from "@/utils/trpc";

import { Button } from "@/components/shared/form/Button";

function Scopes({ scopeString }: { scopeString: string }) {
  const scopes = scopeString.split(" ");

  return (
    <ul className="ml-8 list-disc">
      {scopes.map((scope) => {
        const label = isScope(scope) ? scopeLabels[scope] : scope;

        return (
          <li key={scope}>
            <strong>{label}</strong> ({scope})
          </li>
        );
      })}
    </ul>
  );
}

export function ProvideAuth() {
  const userTwitchScope = trpc.adminTwitch.getUserScope.useQuery();

  return (
    <div className="flex flex-col gap-2">
      <p>
        {userTwitchScope.data ? (
          userTwitchScope.data.scope === null ? (
            "Not authenticated"
          ) : (
            <>
              <strong>Authenticated with scope:</strong>
              <br />
              <Scopes scopeString={userTwitchScope.data.scope} />
            </>
          )
        ) : (
          "Loading …"
        )}
      </p>

      <Button
        onClick={() =>
          signIn(
            "twitch",
            { redirect: false },
            {
              scope: [...defaultScopes, ...botScopes].join(" "),
            },
          )
        }
      >
        Auth as broadcaster/moderator
      </Button>
    </div>
  );
}

import { signIn } from "next-auth/react";
import React from "react";

import { botScope, defaultScope, scopeLabels } from "@/config/twitch";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/shared/Button";

function Scopes({ scopeString }: { scopeString: string }) {
  const scopes = scopeString.split(" ");

  return (
    <ul className="ml-8 list-disc">
      {scopes.map((scope) => {
        const label = scope in scopeLabels ? scopeLabels[scope] : scope;

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
              scope: `${defaultScope} ${botScope}`,
            },
          )
        }
      >
        Auth as broadcaster/moderator
      </Button>
    </div>
  );
}

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

import { scopeGroups } from "@/data/twitch";

import usePresetAccess from "@/hooks/preset-access";

export default function AccessNotice() {
  const { data: session } = useSession();
  const access = usePresetAccess();
  if (access.isPending)
    return (
      <p role="status" className="my-2 text-sm">
        Checking preset access...
      </p>
    );
  if (access.isError)
    return (
      <p role="alert" className="my-2 text-sm">
        Unable to check preset access.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => void access.refetch()}
        >
          Retry
        </button>
      </p>
    );
  if (access.data?.canLoad) return null;
  const reason = access.data?.reason;
  return (
    <p className="my-2 text-sm">
      {reason === "login" ? (
        <Link
          href="/auth/signin?callbackUrl=/about/tech/presets"
          className="underline"
        >
          Log in to load presets.
        </Link>
      ) : reason === "paused" ? (
        "Subscriber preset loading is paused. Operators can still manage and load presets."
      ) : reason === "subscription" ? (
        "An active Alveus Twitch subscription is required to load presets."
      ) : reason === "subscription-scope" ? (
        <button
          type="button"
          className="underline"
          onClick={() =>
            void signIn(
              "twitch",
              { callbackUrl: "/about/tech/presets" },
              {
                scope: [
                  ...new Set([
                    ...scopeGroups.default,
                    ...(session?.user?.scopes ?? []),
                  ]),
                ].join(" "),
              },
            )
          }
        >
          Sign in again to allow subscription verification.
        </button>
      ) : (
        "Preset controls are unavailable. Please try again later."
      )}
    </p>
  );
}

import Link from "next/link";

import usePresetAccess from "@/hooks/preset-access";

export default function AccessNotice() {
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
      ) : reason === "banned" ? (
        "Preset controls are unavailable while you are banned or timed out in Alveus Sanctuary chat."
      ) : reason === "paused" ? (
        "Subscriber preset loading is paused. Operators can still manage and load presets."
      ) : reason === "subscription" ? (
        "An active Alveus Twitch subscription is required to load presets."
      ) : reason === "subscription-scope" ? (
        <Link
          href="/auth/signin?callbackUrl=/about/tech/presets"
          className="underline"
        >
          Sign in again to allow subscription verification.
        </Link>
      ) : (
        "Preset controls are unavailable. Please try again later."
      )}
    </p>
  );
}

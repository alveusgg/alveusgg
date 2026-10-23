import { useRouter } from "next/router";
import { type ComponentType, useCallback, useState } from "react";

import type { MuralId } from "@/data/murals";

import { type IconProps } from "@/icons/BaseIcon";
import IconDollar from "@/icons/IconDollar";
import IconSearch from "@/icons/IconSearch";
import IconTwitch from "@/icons/IconTwitch";

export type RenameMethodId = "twitch" | "website" | "receipt";

export type RenameMethod = {
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
  action: string;
};

export const renameMethods: Record<RenameMethodId, RenameMethod> = {
  twitch: {
    icon: IconTwitch,
    title: "Twitch Charity",
    description:
      "Donated during a stream on Twitch? Those pixels are linked to the Twitch account you donated with.",
    action: "Log in with Twitch",
  },
  website: {
    icon: IconDollar,
    title: "Directly on our website",
    description:
      "Donated through the form on this website? Those pixels are linked to the donor account you manage your donations with.",
    action: "Log in with your donor account",
  },
  receipt: {
    icon: IconSearch,
    title: "PayPal or The Giving Block",
    description:
      "Donated through PayPal or The Giving Block? Find those pixels with the name and email on your donation receipt.",
    action: "Search with your receipt",
  },
};

export const renameMethodIds = Object.keys(renameMethods) as RenameMethodId[];

const isRenameMethodId = (value: unknown): value is RenameMethodId =>
  typeof value === "string" && value in renameMethods;

export function getRenameReturnTo(muralId: MuralId, method: RenameMethodId) {
  return `/institute/pixels/${muralId}/rename?via=${method}`;
}

/**
 * The method picked by the visitor, kept in the `via` query parameter so it
 * survives the login redirects. Falls back to a method they are logged in with.
 */
export function useRenameMethod({
  available,
  loggedIn,
}: {
  available: RenameMethodId[];
  loggedIn: RenameMethodId[];
}) {
  const router = useRouter();
  // undefined: not touched yet, null: explicitly cleared
  const [picked, setPicked] = useState<RenameMethodId | null | undefined>(
    undefined,
  );

  const fromQuery = isRenameMethodId(router.query.via)
    ? router.query.via
    : null;
  const candidate =
    picked === undefined ? (fromQuery ?? loggedIn[0] ?? null) : picked;
  const selected =
    candidate && available.includes(candidate) ? candidate : null;

  const select = useCallback(
    (method: RenameMethodId | null) => {
      setPicked(method);
      const query = { ...router.query };
      delete query.via;
      if (method) query.via = method;
      void router.replace({ query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  return { selected, select };
}

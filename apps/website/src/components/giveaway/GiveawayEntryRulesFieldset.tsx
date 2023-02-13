import React from "react";
import type { Giveaway } from "@prisma/client";
import Link from "next/link";

type GiveawayEntryRulesFieldsetProps = {
  giveaway: Giveaway;
};

export function GiveawayEntryRulesFieldset({
  giveaway,
}: GiveawayEntryRulesFieldsetProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-bold">Rules</legend>
      <label className="flex flex-row gap-3">
        <input type="checkbox" required={true} />
        <span>
          I agree to the{" "}
          <Link
            className="underline"
            href={`/giveaways/${giveaway.slug || giveaway.id}/rules`}
            target="_blank"
          >
            Official Rules
          </Link>
        </span>
      </label>
    </fieldset>
  );
}

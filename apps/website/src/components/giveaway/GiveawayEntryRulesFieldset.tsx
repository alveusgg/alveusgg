import React from "react";
import type { Giveaway } from "@prisma/client";
import Link from "next/link";

import { Fieldset } from "../shared/form/Fieldset";
import { CheckboxField } from "../shared/form/CheckboxField";

type GiveawayEntryRulesFieldsetProps = {
  giveaway: Giveaway;
};

export function GiveawayEntryRulesFieldset({
  giveaway,
}: GiveawayEntryRulesFieldsetProps) {
  return (
    <Fieldset legend="Rules">
      <CheckboxField isRequired={true}>
        I agree to the{" "}
        <Link
          className="underline"
          href={`/giveaways/${giveaway.slug || giveaway.id}/rules`}
          target="_blank"
        >
          Official Rules
        </Link>
      </CheckboxField>
    </Fieldset>
  );
}

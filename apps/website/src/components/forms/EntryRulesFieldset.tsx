import React from "react";
import type { Form } from "@prisma/client";
import Link from "next/link";

import { Fieldset } from "../shared/form/Fieldset";
import { CheckboxField } from "../shared/form/CheckboxField";

type EntryRulesFieldsetProps = {
  form: Form;
};

export function EntryRulesFieldset({ form }: EntryRulesFieldsetProps) {
  return (
    <Fieldset legend="Rules">
      <CheckboxField isRequired={true} name="acceptRules" value="yes">
        I agree to the{" "}
        <Link
          className="underline"
          href={`/forms/${form.slug || form.id}/rules`}
          target="_blank"
        >
          Official Rules
        </Link>
      </CheckboxField>
    </Fieldset>
  );
}

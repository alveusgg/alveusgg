import type { Form } from "@/server/db/client";

import { Fieldset } from "@/components/shared/form/Fieldset";
import { CheckboxField } from "@/components/shared/form/CheckboxField";

import Link from "@/components/content/Link";

type EntryRulesFieldsetProps = {
  form: Form;
};

export function EntryRulesFieldset({ form }: EntryRulesFieldsetProps) {
  return (
    <Fieldset legend="Rules">
      <CheckboxField isRequired={true} name="acceptRules" value="yes">
        I agree to the{" "}
        <Link href={`/forms/${form.slug || form.id}/rules`} external>
          Official Rules
        </Link>
      </CheckboxField>
    </Fieldset>
  );
}

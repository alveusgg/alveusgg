import type { Form } from "@/server/db/client";

import Link from "@/components/content/Link";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";

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

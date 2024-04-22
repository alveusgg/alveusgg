import type { Form } from "@prisma/client";

import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";

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

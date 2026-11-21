import { FORM_ENTRY_MAX_LENGTHS } from "@/utils/forms";

import { FieldGroup } from "../shared/form/FieldGroup";
import { Fieldset } from "../shared/form/Fieldset";
import { TextField } from "../shared/form/TextField";

export function NameFieldset() {
  return (
    <Fieldset legend="Name">
      <FieldGroup>
        <TextField
          label="First name"
          name="given-name"
          maxLength={FORM_ENTRY_MAX_LENGTHS.name}
          autoComplete="given-name"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="Last name"
          name="family-name"
          maxLength={FORM_ENTRY_MAX_LENGTHS.name}
          autoComplete="family-name"
          isRequired={true}
          minLength={1}
        />
      </FieldGroup>
    </Fieldset>
  );
}

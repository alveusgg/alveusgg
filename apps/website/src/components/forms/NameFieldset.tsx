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
          autoComplete="given-name"
          isRequired={true}
          minLength={1}
        />

        <TextField
          label="Last name"
          name="family-name"
          autoComplete="family-name"
          isRequired={true}
          minLength={1}
        />
      </FieldGroup>
    </Fieldset>
  );
}

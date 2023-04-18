import React from "react";

import { TextField } from "../shared/form/TextField";
import { FieldGroup } from "../shared/form/FieldGroup";
import { Fieldset } from "../shared/form/Fieldset";

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

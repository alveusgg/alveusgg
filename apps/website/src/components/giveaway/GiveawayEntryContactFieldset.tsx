import React from "react";

import { Fieldset } from "../shared/form/Fieldset";
import { TextField } from "../shared/form/TextField";

export const GiveawayEntryContactFieldset: React.FC<{
  defaultEmailAddress?: string;
}> = ({ defaultEmailAddress }) => (
  <Fieldset legend="Contact">
    <TextField
      label="Email address"
      name="email"
      type="email"
      autoComplete="email"
      isRequired={true}
      defaultValue={defaultEmailAddress}
      minLength={3}
    />
  </Fieldset>
);

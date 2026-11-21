import { FORM_ENTRY_MAX_LENGTHS } from "@/utils/forms";

import { Fieldset } from "../shared/form/Fieldset";
import { TextField } from "../shared/form/TextField";

export const ContactFieldset = ({
  defaultEmailAddress,
}: {
  defaultEmailAddress?: string;
}) => (
  <Fieldset legend="Contact & Updates">
    <TextField
      label="Email address"
      name="email"
      maxLength={FORM_ENTRY_MAX_LENGTHS.email}
      type="email"
      autoComplete="email"
      isRequired={true}
      defaultValue={defaultEmailAddress}
      minLength={3}
    />
  </Fieldset>
);

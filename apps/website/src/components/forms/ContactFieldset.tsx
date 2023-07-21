import React from "react";

import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL } from "@/utils/forms";

import { Fieldset } from "../shared/form/Fieldset";
import { TextField } from "../shared/form/TextField";

export const ContactFieldset: React.FC<{
  defaultEmailAddress?: string;
  askMarketingEmails?: boolean;
  askMarketingEmailsLabel?: string;
}> = ({
  defaultEmailAddress,
  askMarketingEmails = false,
  askMarketingEmailsLabel,
}) => (
  <Fieldset legend="Contact & Updates">
    <TextField
      label="Email address"
      name="email"
      type="email"
      autoComplete="email"
      isRequired={true}
      defaultValue={defaultEmailAddress}
      minLength={3}
    />

    {askMarketingEmails && (
      <CheckboxField name="allowMarketingEmails" value="yes">
        {askMarketingEmailsLabel || PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL}
      </CheckboxField>
    )}
  </Fieldset>
);

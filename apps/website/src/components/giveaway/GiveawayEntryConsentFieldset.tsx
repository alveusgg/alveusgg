import React from "react";

import Link from "../content/Link";
import { Fieldset } from "../shared/form/Fieldset";
import { CheckboxField } from "../shared/form/CheckboxField";

export function GiveawayEntryConsentFieldset() {
  return (
    <Fieldset legend="Data processing">
      <CheckboxField isRequired={true}>
        I have read and accept the{" "}
        <Link className="underline" href="/privacy-policy" external>
          Privacy Policy
        </Link>
        . I understand that my personal data, including my mailing address, will
        be used solely for the purpose of fulfilling the giveaway. My data will
        be transferred and stored securely using encryption, and deleted once
        the giveaway is completed.
      </CheckboxField>
    </Fieldset>
  );
}

import React from "react";

import Link from "../content/Link";
import { Fieldset } from "../shared/form/Fieldset";
import { CheckboxField } from "../shared/form/CheckboxField";

export function ConsentFieldset() {
  return (
    <Fieldset legend="Data processing">
      <CheckboxField isRequired={true} name="acceptPrivacy" value="yes">
        I have read and accept the{" "}
        <Link className="underline" href="/privacy-policy" external>
          Privacy Policy
        </Link>
        . I understand that my personal data, including my mailing address, will
        be used solely for fulfilling the purpose stated above. My data will be
        transferred and stored securely using encryption, and deleted once the
        process is completed.
      </CheckboxField>
    </Fieldset>
  );
}

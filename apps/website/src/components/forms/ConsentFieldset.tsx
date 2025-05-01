import { PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL } from "@/utils/forms";

import Link from "@/components/content/Link";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";

export function ConsentFieldset({
  withShippingAddress = false,
  askMarketingEmails = false,
  askMarketingEmailsLabel = "",
}) {
  return (
    <Fieldset legend="Data processing">
      <CheckboxField isRequired={true} name="acceptPrivacy" value="yes">
        I have read and accept the{" "}
        <Link href="/privacy-policy" external>
          Privacy Policy
        </Link>
        .{" "}
        {`I understand that my personal data${
          withShippingAddress ? ", including my shipping address," : ""
        } will be used solely for the purpose stated above.
        This data will be transferred and stored securely using encryption,
        and deleted once its intended purpose has been fulfilled.`}
      </CheckboxField>

      {askMarketingEmails && (
        <CheckboxField name="allowMarketingEmails" value="yes">
          {askMarketingEmailsLabel || PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL}
        </CheckboxField>
      )}
    </Fieldset>
  );
}

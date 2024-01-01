import { useState } from "react";
import type { InferGetStaticPropsType, NextPageContext, NextPage } from "next";
import { getSession } from "next-auth/react";

import { getAdminSSP } from "@/server/utils/admin";
import { permissions } from "@/config/permissions";

import { trpc } from "@/utils/trpc";
import { parseOptions } from "@/utils/email";

import Meta from "@/components/content/Meta";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Panel } from "@/components/admin/Panel";
import { Headline } from "@/components/admin/Headline";

import { Button } from "@/components/shared/Button";
import { SafeHtml } from "@/components/shared/SafeHtml";
import { MessageBox } from "@/components/shared/MessageBox";

import { Fieldset } from "@/components/shared/form/Fieldset";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import { RichTextField } from "@/components/shared/form/RichTextField";

import { EmailTemplateContent } from "@/components/email/template";

export async function getServerSideProps(context: NextPageContext) {
  const adminProps = await getAdminSSP(context, permissions.viewDashboard);
  if (!adminProps) {
    return { notFound: true };
  }

  const session = await getSession(context);

  return {
    props: {
      ...adminProps,
      defaultTo: session?.user?.email || undefined,
    },
  };
}

const EmailPreviewPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, defaultTo }) => {
  const [lightMode, setLightMode] = useState(true);
  const [subject, setSubject] = useState("Email Test");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState(
    "This is a <strong>test</strong> <em>email</em>!",
  );

  const sendTestEmail = trpc.adminEmails.sendTestEmail.useMutation();

  return (
    <>
      <Meta title="Admin" />

      <AdminPageLayout title="Email preview" menuItems={menuItems}>
        <Headline>Send test email</Headline>

        <Panel>
          {sendTestEmail.error && (
            <MessageBox variant="failure">
              {sendTestEmail.error.message}
            </MessageBox>
          )}
          {sendTestEmail.data && (
            <MessageBox variant="success">Email sent!</MessageBox>
          )}
          {sendTestEmail.isLoading && (
            <MessageBox variant="default">Sending email...</MessageBox>
          )}

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();

              const formData = new FormData(event.currentTarget);

              sendTestEmail.mutate({
                to: String(formData.get("to")),
                subject,
                preview,
                body,
              });
            }}
          >
            <Fieldset legend="Content">
              <TextField
                label="Subject"
                name="subject"
                isRequired
                value={subject}
                onChange={setSubject}
              />
              <RichTextField
                label="Body"
                name="body"
                value={body}
                onChange={setBody}
              />
            </Fieldset>

            <Fieldset legend="Send email">
              <TextField
                label="Preview"
                name="preview"
                placeholder="This should give a short description of the email (less than 90 characters)"
                maxLength={90}
                value={preview}
                onChange={setPreview}
              />
              <FieldGroup>
                <TextField
                  label="To"
                  name="to"
                  isRequired
                  defaultValue={defaultTo}
                />
                <div className="flex items-end">
                  <Button type="submit" size="small">
                    Send
                  </Button>
                </div>
              </FieldGroup>
            </Fieldset>
          </form>
        </Panel>

        <Headline>Preview email</Headline>

        <CheckboxField
          defaultSelected={lightMode}
          onChange={(isSelected) => {
            setLightMode(isSelected);
          }}
        >
          Light mode
        </CheckboxField>

        <Panel lightMode={lightMode}>
          <div className="alveus-ugc">
            <EmailTemplateContent subject={subject} unsubscribeLink="#">
              <SafeHtml html={body} parseOptions={parseOptions} />
            </EmailTemplateContent>
          </div>
        </Panel>
      </AdminPageLayout>
    </>
  );
};
export default EmailPreviewPage;

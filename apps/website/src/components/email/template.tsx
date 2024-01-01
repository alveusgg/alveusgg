import type { ReactNode } from "react";
import { Preview } from "@react-email/preview";

import { EmailHeader } from "./EmailHeader";
import { Container } from "./Container";
import { Hr } from "./Hr";
import { Text } from "./Text";
import { Link } from "./Link";
import { Section } from "./Section";

type EmailTemplateProps = {
  subject: string;
  children?: ReactNode;
  unsubscribeLink: string;
  preview?: string;
};

type EmailTemplateContentProps = Omit<EmailTemplateProps, "preview">;

export const EmailTemplateContent = ({
  subject,
  children = "",
  unsubscribeLink,
}: EmailTemplateContentProps) => (
  <Container>
    <EmailHeader />
    <Hr style={{ marginTop: 10, marginBottom: 30 }} />
    <Section>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        {subject}
      </h2>
      <Text as="div">{children}</Text>
    </Section>
    <Hr style={{ marginTop: 30, marginBottom: 30 }} />
    <Section>
      <Text style={{ textAlign: "center" }}>
        You receive this email because you are subscribed to Alveus Sanctuary.
        <br />
        <Link href={unsubscribeLink}>Unsubscribe</Link>
      </Text>
      <Text style={{ textAlign: "center" }}>
        Copyright &copy; {new Date().getFullYear()} Alveus Sanctuary &middot;
        All rights reserved &middot; EIN: 86-1772907
      </Text>
    </Section>
  </Container>
);

export const EmailTemplate = ({
  subject,
  preview,
  ...props
}: EmailTemplateProps) => (
  <html lang="en" dir="ltr">
    {/* eslint-disable-next-line @next/next/no-head-element */}
    <head>
      <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
      <title>{subject}</title>
    </head>
    {preview && <Preview>{preview}</Preview>}

    <body>
      <EmailTemplateContent subject={subject} {...props} />
    </body>
  </html>
);

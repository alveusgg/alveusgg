import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import type { Form } from "@prisma/client";
import { useRouter } from "next/router";

import { env } from "@/env/index.mjs";

import { trpc } from "@/utils/trpc";
import {
  calcFormConfig,
  PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL,
  PLACEHOLDER_SUBMIT_BUTTON_TEXT,
} from "@/utils/forms";
import { convertToSlug, SLUG_PATTERN } from "@/utils/slugs";
import {
  inputValueDatetimeLocalToUtc,
  utcToInputValueDatetimeLocal,
} from "@/utils/local-datetime";

import { type FormSchema } from "@/server/db/forms";

import { Button, defaultButtonClasses } from "@/components/shared/Button";
import Markdown from "@/components/content/Markdown";
import { TextField } from "@/components/shared/form/TextField";
import { TextAreaField } from "@/components/shared/form/TextAreaField";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { FieldGroup } from "@/components/shared/form/FieldGroup";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { LocalDateTimeField } from "@/components/shared/form/LocalDateTimeField";
import { MessageBox } from "@/components/shared/MessageBox";

type FormFormProps = {
  action: "create" | "edit";
  form?: Form;
};

export function FormForm({ action, form }: FormFormProps) {
  const router = useRouter();
  const submit = trpc.adminForms.createOrEditForm.useMutation();

  const defaultConfig = calcFormConfig(form?.config);
  const [intro, setIntro] = useState(defaultConfig.intro || "");
  const [rules, setRules] = useState(defaultConfig.rules || "");
  const [label, setLabel] = useState(form?.label || "");
  const [askMarketingEmails, setAskMarketingEmails] = useState(
    defaultConfig.askMarketingEmails || false,
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);

      const mutationData: FormSchema = {
        label: String(formData.get("label")),
        config: {
          checks: formData.get("checks") === "true",
          requireShippingAddress:
            formData.get("requireShippingAddress") === "true",
          askMarketingEmails,
          askMarketingEmailsLabel: formData.has("askMarketingEmailsLabel")
            ? String(formData.get("askMarketingEmailsLabel"))
            : undefined,
          intro: formData.has("intro")
            ? String(formData.get("intro"))
            : undefined,
          rules: formData.has("rules")
            ? String(formData.get("rules"))
            : undefined,
          submitButtonText: formData.has("submitButtonText")
            ? String(formData.get("submitButtonText"))
            : undefined,
        },
      };

      const slug = formData.has("slug") && String(formData.get("slug"));
      if (slug && slug !== "") {
        mutationData.slug = slug;
      }

      const startAt =
        formData.has("startAt") && String(formData.get("startAt"));
      if (startAt && startAt !== "") {
        mutationData.startAt = inputValueDatetimeLocalToUtc(startAt);
      }

      const endAt = formData.has("endAt") && String(formData.get("endAt"));
      if (endAt && endAt !== "") {
        mutationData.endAt = inputValueDatetimeLocalToUtc(endAt);
      }

      if (action === "edit") {
        if (!form) return;
        submit.mutate({ action: "edit", id: form.id, ...mutationData });
      } else {
        submit.mutate(
          { action: "create", ...mutationData },
          {
            onSuccess: async () => {
              await router.push(`/admin/forms`);
            },
          },
        );
      }
    },
    [action, form, router, submit, askMarketingEmails],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {submit.error && (
        <MessageBox variant="failure">
          <pre>{submit.error.message}</pre>
        </MessageBox>
      )}
      {submit.isSuccess && (
        <MessageBox variant="success">Form updated!</MessageBox>
      )}

      <Fieldset legend="Form">
        <TextField
          label="Name"
          name="label"
          value={label}
          onChange={setLabel}
        />
        <TextField
          label="Slug (Public URL, alphanumeric, dashes allowed)"
          name="slug"
          pattern={SLUG_PATTERN}
          inputMode="url"
          defaultValue={form?.slug || ""}
          inputClassName="font-mono"
          placeholder={convertToSlug(label)}
          prefix={
            <div className="cursor-default select-none pl-2 font-mono">{`${env.NEXT_PUBLIC_BASE_URL}/forms/`}</div>
          }
        />
      </Fieldset>

      <Fieldset legend="User entry">
        <CheckboxField
          name="checks"
          value="true"
          defaultSelected={defaultConfig.checks}
        >
          Require users to perform actions to enter
        </CheckboxField>

        <CheckboxField
          name="requireShippingAddress"
          value="true"
          defaultSelected={defaultConfig.requireShippingAddress}
        >
          Require shipping address
        </CheckboxField>
      </Fieldset>

      <Fieldset legend="Marketing">
        <CheckboxField
          name="askMarketingEmails"
          value="true"
          defaultSelected={defaultConfig.askMarketingEmails}
          isSelected={askMarketingEmails}
          onChange={setAskMarketingEmails}
        >
          Ask user to allow sending marketing emails
        </CheckboxField>

        <TextField
          label="Checkbox label asking user to allow marketing emails"
          name="askMarketingEmailsLabel"
          placeholder={PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL}
          defaultValue={defaultConfig.askMarketingEmailsLabel}
          isDisabled={!askMarketingEmails}
        />
      </Fieldset>

      <Fieldset legend="Time and date">
        <FieldGroup>
          <LocalDateTimeField
            label="Start (Central Time)"
            name="startAt"
            defaultValue={utcToInputValueDatetimeLocal(form?.startAt)}
          />
          <LocalDateTimeField
            label="End (Central Time)"
            name="endAt"
            defaultValue={utcToInputValueDatetimeLocal(form?.endAt)}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset legend="Intro">
        <FieldGroup>
          <TextAreaField
            label="Intro Markdown"
            name="intro"
            value={intro}
            onChange={(value) => setIntro(value)}
            inputClassName="min-h-[100px]"
          />
          <div className="flex-1">
            <div>Preview</div>
            <div className="max-h-[500px] min-h-[100px] overflow-auto rounded-lg bg-alveus-tan-50 p-4 text-black">
              <Markdown content={intro} />
            </div>
          </div>
        </FieldGroup>
      </Fieldset>

      <Fieldset legend="Rules">
        <FieldGroup>
          <TextAreaField
            label="Rules Markdown"
            name="rules"
            value={rules}
            onChange={(value) => setRules(value)}
            inputClassName="min-h-[100px]"
          />
          <div className="flex-1">
            <div>Preview</div>
            <div className="max-h-[500px] min-h-[100px] overflow-auto rounded-lg bg-alveus-tan-50 p-4 text-black">
              <Markdown content={rules} />
            </div>
          </div>
        </FieldGroup>
      </Fieldset>

      <Fieldset legend="Appearance">
        <TextField
          label="Submit button text"
          name="submitButtonText"
          placeholder={PLACEHOLDER_SUBMIT_BUTTON_TEXT}
          className="max-w-[200px]"
          defaultValue={defaultConfig.submitButtonText}
        />
      </Fieldset>

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}

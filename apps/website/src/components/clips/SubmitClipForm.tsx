import type { FormEvent } from "react";
import { useState } from "react";

import { useRouter } from "next/router";

import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/shared/form/Button";
import type { ClipSubmitInput } from "@/server/db/clips";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import IconLoading from "@/icons/IconLoading";

const SubmitClipForm = () => {
  const addMutation = trpc.clips.addClip.useMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: ClipSubmitInput = {
      url: formData.get("clipUrl") as string,
      title: "",
    };

    addMutation.mutate(data, {
      onSuccess: () => {
        router.reload();
      },
      onError: (error) => {
        setError(error.message);
        setSubmitting(false);
      },
    });
  };

  const validateForm = (e: FormEvent<HTMLFormElement>) => {
    if (!e.currentTarget.reportValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} onClick={validateForm}>
      {error && <MessageBox variant="failure">{error}</MessageBox>}

      <div className="flex flex-col gap-5 md:flex-row">
        <div className="grow">
          <Fieldset legend="Clip details" legendClassName="sr-only">
            <TextField
              label="Clip URL"
              inputMode="url"
              type="url"
              isRequired
              name="clipUrl"
              autoFocus={true}
            />
          </Fieldset>
        </div>

        <div className="flex flex-col justify-end">
          <Button type="submit">
            {submitting ? <IconLoading /> : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SubmitClipForm;

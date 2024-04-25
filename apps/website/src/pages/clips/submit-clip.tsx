import type { NextPage } from "next";
import Image from "next/image";
import type { FormEvent } from "react";
import { useState } from "react";

import { useRouter } from "next/router";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";

import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

import { Fieldset } from "@/components/shared/form/Fieldset";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/shared/form/Button";
import type { ClipSubmitInput } from "@/server/db/clips";
import { trpc } from "@/utils/trpc";
import { MessageBox } from "@/components/shared/MessageBox";
import IconLoading from "@/icons/IconLoading";
import ClipsNavigation from "@/components/clips/ClipsNavigation";

const SubmitClipPage: NextPage = () => {
  const add = trpc.clips.addClip.useMutation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: ClipSubmitInput = {
      url: formData.get("clipUrl") as string,
      title: formData.get("clipTitle") as string,
    };

    add.mutate(data, {
      onSuccess: () => {
        router.push("/clips");
      },
      onError: (error) => {
        setError(error.message);
        setSubmitting(false);
      },
    });
  };

  return (
    <>
      <Meta
        title="Clips"
        description="Explore and vote on Twitch clips from our community streams. Discover community-curated highlights and top moments."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Section
          dark
          className="py-24"
          containerClassName="flex flex-wrap gap-4 justify-between"
        >
          <div className="w-full lg:w-3/5">
            <Heading>Alveus Clips</Heading>
            <p className="text-lg">
              Submit and vote for your favorite Alveus clips
            </p>
          </div>
          <ClipsNavigation />
        </Section>
      </div>

      {/* Grow the last section to cover the page */}
      <div className="relative flex flex-grow flex-col">
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -bottom-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <Section className="flex-grow pt-0">
          <form
            className="my-5 flex flex-col gap-5 lg:mx-auto lg:w-1/2"
            onSubmit={handleSubmit}
          >
            {error && <MessageBox variant="failure">{error}</MessageBox>}
            <div className="flex flex-col gap-5 lg:gap-20">
              <Fieldset legend="Clip Details">
                <TextField label="Clip URL" isRequired name="clipUrl" />
                <TextField
                  label="Title (optional)"
                  name="clipTitle"
                  placeholder="Optionally provide a custom title for the clip"
                />
              </Fieldset>
            </div>
            <Button type="submit">
              {submitting ? <IconLoading /> : "Submit"}
            </Button>
          </form>
        </Section>
      </div>
    </>
  );
};

export default SubmitClipPage;

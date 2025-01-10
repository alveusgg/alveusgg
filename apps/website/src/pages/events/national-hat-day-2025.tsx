import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import { generatePreSignedUploadUrl } from "@/server/utils/community-photos";
import { imageMimeTypes } from "@/utils/files";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import Heading from "@/components/content/Heading";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "@/components/shared/form/UploadAttachmentsField";

import { ImageUploadFilePreview } from "@/components/shared/form/ImageUploadAttachment";
import Link from "@/components/content/Link";
import IconArrowRight from "@/icons/IconArrowRight";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (session?.user?.name) {
    return {
      props: {
        preSignedUploadUrl: await generatePreSignedUploadUrl(session.user.name),
      },
    };
  }

  return {
    props: {},
  };
}

function Upload({ preSignedUploadUrl }: { preSignedUploadUrl: string }) {
  const upload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(preSignedUploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log(response.status);

    return {
      viewUrl: "",
      fileStorageObjectId: "",
    };
  };

  const imageAttachmentsData = useUploadAttachmentsData();

  return (
    <UploadAttachmentsField
      {...imageAttachmentsData}
      upload={upload}
      maxNumber={100}
      maxFileSize={99_000_000}
      allowedFileTypes={imageMimeTypes}
      label=""
      resizeImageOptions={undefined}
      renderAttachment={({ key, fileReference }) => (
        <div
          key={key}
          className="relative aspect-video w-48 overflow-hidden rounded-md bg-black shadow-lg"
        >
          <ImageUploadFilePreview fileReference={fileReference} />
        </div>
      )}
      attachmentsClassName="flex gap-4 my-10 flex-wrap justify-center"
    />
  );
}

const NationalHatDayPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ preSignedUploadUrl }) => {
  return (
    <>
      <Meta title="National Hat Day 2025" description="TODO" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="py-8">
        <Heading className="text-center">National Hat Day 2025</Heading>
      </Section>

      <Section containerClassName="max-w-lg text-center">
        <Heading level={2}>
          Submit your screenshots for National Hat Day
        </Heading>

        {preSignedUploadUrl ? (
          <Upload preSignedUploadUrl={preSignedUploadUrl} />
        ) : (
          <>
            <p>You need to be logged in to submit screenshots!</p>
            <br />

            <LoginWithTwitchButton />
          </>
        )}
      </Section>
      <Section containerClassName="max-w-lg text-center">
        <Link
          href="https://alveuscommunity.photos/share/DCOfWPj5lfQYQXlwtwSscNT7WQaWwovClFMBxVwkJOgducmv5yEVABTjGq0mfonbYME"
          external
          custom
          className="group mb-2 mt-4 flex w-full items-center gap-2 rounded-xl bg-gray-700 px-4 py-2 text-start text-white"
        >
          <div className="flex grow flex-wrap items-baseline gap-x-4">
            See what others have submitted
          </div>

          <IconArrowRight className="box-content shrink-0 p-1" size={32} />
        </Link>
      </Section>
    </>
  );
};

export default NationalHatDayPage;

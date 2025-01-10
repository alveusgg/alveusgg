import type { InferGetStaticPropsType, NextPage, NextPageContext } from "next";
import { getSession } from "next-auth/react";

import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (session?.user?.id) {
    return {
      props: {
        isLoggedIn: true,
        preSignedUploadUrl:
          "https://upload.alveuscommunity.photos/upload?key=dc620267-7624-42a6-ac87-842b4a173665",
      },
    };
  }

  return {
    props: {
      isLoggedIn: false,
    },
  };
}

function Upload({ preSignedUploadUrl }: { preSignedUploadUrl: string }) {
  const submit = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(preSignedUploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log(response.status);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await submit(file);
      }}
    />
  );
}

const BookClubPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ isLoggedIn, preSignedUploadUrl }) => {
  return (
    <>
      <Meta title="TODO" description="TODO" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section className="grow">
        {isLoggedIn && preSignedUploadUrl ? (
          <Upload preSignedUploadUrl={preSignedUploadUrl} />
        ) : (
          "Need to be logged in to upload"
        )}
      </Section>
    </>
  );
};

export default BookClubPage;

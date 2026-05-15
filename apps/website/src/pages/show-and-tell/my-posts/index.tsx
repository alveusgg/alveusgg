import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { featuredAttachmentsImage } from "@/utils/attachments";
import { getEntityStatus } from "@/utils/entity-helpers";
import { trpc } from "@/utils/trpc";

import DateTime from "@/components/content/DateTime";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/form/Button";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";

import IconEye from "@/icons/IconEye";
import IconPencil from "@/icons/IconPencil";
import IconTrash from "@/icons/IconTrash";

import showAndTellHeader from "@/assets/show-and-tell/header.png";

const cellClasses = "p-1 md:p-2 align-top tabular-nums";

const MyShowAndTellEntriesPage: NextPage = () => {
  const session = useSession();
  const myEntries = trpc.showAndTell.getMyEntries.useQuery();
  const deleteMutation = trpc.showAndTell.delete.useMutation({
    onSuccess: async () => {
      await myEntries.refetch();
    },
  });

  return (
    <>
      <Meta
        title="Your Posts | Show and Tell"
        description="Sign in and view your previously submitted posts, sharing your conservation and wildlife-related activities."
        image={showAndTellHeader.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-y-8 gap-x-4 justify-between lg:flex-nowrap"
      >
        <div className="w-full grow lg:w-auto">
          <Heading level={1}>Show and Tell: Your Posts</Heading>
          <p className="text-lg">
            {session?.status === "authenticated" ? "View" : "Sign in and view"}{" "}
            your previously submitted posts, sharing your conservation and
            wildlife-related activities.
          </p>
        </div>

        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="grow">
        <header>
          <Heading level={2}>Your Show and Tell submissions</Heading>
        </header>

        {session?.status !== "authenticated" && (
          <div>
            <p>
              Please log in if you would like to edit or keep track of your
              posts:
            </p>

            <div className="my-4 flex flex-row items-center justify-center">
              <div className="flex-1">
                <LoginWithTwitchButton />
              </div>
            </div>
          </div>
        )}

        {session?.status === "authenticated" && (
          <>
            {myEntries.isPending && <p>Loading...</p>}
            {myEntries.isError && <p>Error: {myEntries.error.message}</p>}
            {myEntries.isSuccess && !myEntries.data.length && (
              <p>No entries found.</p>
            )}

            {myEntries.data && myEntries.data.length > 0 && (
              <div className="overflow-x-auto scroll-smooth">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className={`${cellClasses} w-[150px] p-2 text-left`}
                      >
                        Image
                      </th>
                      <th
                        scope="col"
                        className={`${cellClasses} w-2/5 text-left`}
                      >
                        Title
                      </th>
                      <th scope="col" className={`${cellClasses} text-left`}>
                        Status
                      </th>
                      <th scope="col" className={`${cellClasses} text-left`}>
                        Created / Updated
                      </th>
                      <th scope="col" className={`${cellClasses} text-left`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myEntries.data.map((entry) => {
                      const featuredImage = featuredAttachmentsImage(
                        entry.attachments,
                      );

                      const status = getEntityStatus(entry);

                      return (
                        <tr key={entry.id} className="border-t border-gray-600">
                          <td className={cellClasses}>
                            {featuredImage && (
                              <Image
                                width={150}
                                height={150}
                                src={featuredImage.url}
                                alt={featuredImage.alternativeText}
                              />
                            )}
                          </td>
                          <td className={`${cellClasses} w-2/5`}>
                            {entry.title}
                          </td>
                          <td className={cellClasses}>
                            {status === "approved"
                              ? "Approved"
                              : "Review pending"}
                          </td>
                          <td className={cellClasses}>
                            <DateTime
                              date={entry.createdAt}
                              format={{
                                style: "long",
                                time: "minutes",
                              }}
                            />
                            {entry.updatedAt &&
                              String(entry.updatedAt) !==
                                String(entry.createdAt) && (
                                <>
                                  <br />
                                  {" ("}
                                  <DateTime
                                    date={entry.updatedAt}
                                    format={{
                                      style: "long",
                                      time: "minutes",
                                    }}
                                  />
                                  {")"}
                                </>
                              )}
                          </td>
                          <td
                            className={`${cellClasses} flex flex-col flex-wrap gap-1 md:flex-row`}
                          >
                            <LinkButton
                              width="auto"
                              size="small"
                              href={`/show-and-tell/my-posts/${entry.id}`}
                            >
                              <IconPencil className="size-5" />
                              Edit
                            </LinkButton>
                            <LinkButton
                              width="auto"
                              size="small"
                              className={secondaryButtonClasses}
                              href={`/show-and-tell/my-posts/${entry.id}/preview`}
                            >
                              <IconEye className="size-5" />
                              Preview
                            </LinkButton>
                            <Button
                              width="auto"
                              size="small"
                              className={dangerButtonClasses}
                              confirmationMessage="Please confirm deletion!"
                              onClick={() => deleteMutation.mutate(entry.id)}
                            >
                              <IconTrash className="size-5" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default MyShowAndTellEntriesPage;

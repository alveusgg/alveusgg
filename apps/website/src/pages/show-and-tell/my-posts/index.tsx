import React from "react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { trpc } from "@/utils/trpc";
import { getEntityStatus } from "@/utils/entity-helpers";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
  secondaryButtonClasses,
} from "@/components/shared/Button";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";
import Meta from "@/components/content/Meta";
import DateTime from "@/components/content/DateTime";
import IconPencil from "@/icons/IconPencil";
import IconEye from "@/icons/IconEye";
import IconTrash from "@/icons/IconTrash";

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
      <Meta title="Your Posts - Show and Tell" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        className="py-12"
        containerClassName="flex flex-wrap gap-4 justify-between"
      >
        <div className="w-full lg:w-3/5">
          <Heading level={1}>Show and Tell: Your Posts</Heading>
          <p className="text-lg">
            Community submissions of their conservation and wildlife related
            activities.
          </p>
        </div>
        <ShowAndTellNavigation />
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
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
            {myEntries.isLoading && <p>Loading...</p>}
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
                        className={`${cellClasses} w-[40%] text-left`}
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
                      const images = entry.attachments.filter(
                        (a) => a.attachmentType === "image",
                      );
                      const featuredImage = images[0]?.imageAttachment;
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
                          <td className={`${cellClasses} w-[40%]`}>
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
                              <IconPencil className="h-5 w-5" />
                              Edit
                            </LinkButton>
                            <LinkButton
                              width="auto"
                              size="small"
                              className={secondaryButtonClasses}
                              href={`/show-and-tell/my-posts/${entry.id}/preview`}
                            >
                              <IconEye className="h-5 w-5" />
                              Preview
                            </LinkButton>
                            <Button
                              width="auto"
                              size="small"
                              className={dangerButtonClasses}
                              confirmationMessage="Please confirm deletion!"
                              onClick={() => deleteMutation.mutate(entry.id)}
                            >
                              <IconTrash className="h-5 w-5" />
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

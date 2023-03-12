import React from "react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import { trpc } from "@/utils/trpc";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import {
  Button,
  LinkButton,
  dangerButtonClasses,
} from "@/components/shared/Button";
import { LocalDateTime } from "@/components/shared/LocalDateTime";
import { ShowAndTellNavigation } from "@/components/show-and-tell/ShowAndTellNavigation";
import { getEntityStatus } from "@/utils/entity-helpers";
import Meta from "@/components/content/Meta";

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
          <Heading level={2}>Your posts</Heading>
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
                        (a) => a.attachmentType === "image"
                      );
                      const featuredImage = images[0]?.imageAttachment;
                      const status = getEntityStatus(entry);

                      return (
                        <tr key={entry.id} className="border-t border-gray-600">
                          <td className={`${cellClasses}`}>
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
                          <td className={`${cellClasses}`}>
                            {status === "approved"
                              ? "Approved"
                              : "Review pending"}
                          </td>
                          <td className={`${cellClasses}`}>
                            <LocalDateTime
                              dateTime={entry.createdAt}
                              format="long"
                            />
                            {entry.updatedAt &&
                              String(entry.updatedAt) !==
                                String(entry.createdAt) && (
                                <>
                                  <br />
                                  {" ("}
                                  <LocalDateTime
                                    dateTime={entry.updatedAt}
                                    format="long"
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
                              <PencilIcon className="h-5 w-5" />
                              Edit
                            </LinkButton>
                            <Button
                              width="auto"
                              size="small"
                              className={dangerButtonClasses}
                              confirmationMessage="Please confirm deletion!"
                              onClick={() => deleteMutation.mutate(entry.id)}
                            >
                              <TrashIcon className="h-5 w-5" />
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

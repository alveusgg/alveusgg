import { useCallback, useEffect } from "react";
import { type NextPage } from "next";
import Image from "next/image";
import { useSession } from "next-auth/react";

import ogImage from "@/assets/events/fall-carnival-2023/og.png";
import leafLeftImage1 from "@/assets/floral/leaf-left-1-fall.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2-fall.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";

import IconDownload from "@/icons/IconDownload";

import {
  eventId,
  stickerPack,
  ticketConfig,
} from "@/data/events/fall-carnival-2023";

import { classes } from "@/utils/classes";
import { trpc } from "@/utils/trpc";
import { getShortBaseUrl } from "@/utils/short-url";
import { getVirtualTicketImageUrl } from "@/utils/virtual-tickets";

import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { ShareButton } from "@/components/shared/ShareButton";

import Section from "@/components/content/Section";
import Meta from "@/components/content/Meta";

import {
  TicketEditor,
  useStickerData,
} from "@/components/events/virtual-ticket/TicketEditor";
import { FallCarnival2023Ticket } from "@/components/events/fall-carnival-2023/VirtualTicket";
import { MovableSticker } from "@/components/events/virtual-ticket/elements/MovableSticker";

import { IntroSection } from "@/components/events/fall-carnival-2023/IntroSection";
import { Activities } from "@/components/events/fall-carnival-2023/Activities";

const FallCarnival2023EventPage: NextPage = () => {
  const session = useSession();

  const myTicket = trpc.virtualTickets.getMyTicket.useQuery(
    { eventId },
    {
      enabled: !!session.data?.user,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const saveMutation = trpc.virtualTickets.save.useMutation();

  const stickerData = useStickerData(ticketConfig, stickerPack);
  const {
    isDirty,
    stickerPositionsRef,
    setStickerData,
    updateStickerPosition,
    saveStickers,
  } = stickerData;

  useEffect(() => {
    if (myTicket.data) setStickerData(myTicket.data.customization.stickers);
  }, [myTicket.data, setStickerData]);

  const handleSave = useCallback(() => {
    saveStickers();
    saveMutation.mutate({
      eventId,
      customization: {
        stickers: stickerPositionsRef.current.map(({ imageId, x, y }) => ({
          imageId,
          x,
          y,
        })),
      },
    });
  }, [saveMutation, saveStickers, stickerPositionsRef]);

  const userName = session.data?.user?.name;

  return (
    <>
      <Meta
        title="Alveus Fall Carnival 2023"
        description="You are invited to the Alveus Fall Carnival 2023 - Customize your ticket!"
        image={ogImage.src}
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-carnival bg-gradient-to-t from-carnival to-carnival-700 lg:block" />

      <div className="relative">
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-[12rem] select-none lg:block"
        />

        <IntroSection />
      </div>

      <Section containerClassName="flex flex-col items-center max-w-none min-h-[80vh]">
        <p className="max-w-xl text-lg md:text-xl lg:text-2xl">
          Design your personal ticket by placing stickers! When you are happy
          with your ticket you can share and download it!
        </p>

        {session.status === "loading" && <p className="py-6">Loading …</p>}
        {session.status === "unauthenticated" && (
          <div className="my-4 flex flex-row items-center justify-center">
            <div className="flex-1">
              <LoginWithTwitchButton />
            </div>
          </div>
        )}

        {session.status === "authenticated" && userName && (
          <>
            <div className="relative my-8 flex flex-row items-center gap-4 align-middle">
              <div
                className={classes(isDirty && "pointer-events-none opacity-40")}
              >
                <a
                  className="flex flex-row items-center justify-center gap-1 rounded-xl bg-gray-700/10 p-1 px-3 text-center hover:bg-gray-700/20"
                  href={getVirtualTicketImageUrl(eventId, userName)}
                  download="alveus-fall-carnival-2023-ticket.png"
                  target="_blank"
                  rel="download"
                >
                  <IconDownload className="mr-1 h-5 w-5" />
                  Download
                </a>
              </div>

              <div
                className={classes(isDirty && "pointer-events-none opacity-40")}
              >
                <ShareButton
                  url={`${getShortBaseUrl()}/fc23/${encodeURIComponent(
                    userName,
                  )}`}
                  title="My Alveus Fall Carnival ticket"
                  text="I claimed my ticket for the Alveus Fall Carnival, November 4th 2023 at 11am CT live on Twitch!"
                />
              </div>

              {(isDirty || myTicket.isLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-alveus-tan text-center italic">
                  <span>
                    {myTicket.isLoading
                      ? "Loading the ticket…"
                      : "You have unsaved changes!"}
                  </span>
                </div>
              )}
            </div>

            <TicketEditor
              {...ticketConfig}
              stickerPack={stickerPack}
              stickerData={stickerData}
              onSave={handleSave}
            >
              <FallCarnival2023Ticket userName={userName}>
                {stickerPositionsRef.current.map((stickerPosition) => (
                  <MovableSticker
                    key={stickerPosition.imageId}
                    {...stickerPosition}
                    onPositionChange={(x, y) => {
                      updateStickerPosition(stickerPosition.imageId, x, y);
                    }}
                  />
                ))}
              </FallCarnival2023Ticket>
            </TicketEditor>
          </>
        )}
      </Section>

      <div className="relative">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -left-8 top-32 z-10 hidden h-auto w-1/3 max-w-[7rem] -rotate-45 select-none lg:block"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute -top-60 right-0 z-10 hidden h-auto w-1/2 max-w-[10rem] select-none lg:block 2xl:-bottom-64 2xl:max-w-[12rem]"
        />

        <Activities />
      </div>
    </>
  );
};

export default FallCarnival2023EventPage;

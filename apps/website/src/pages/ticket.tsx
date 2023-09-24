import { type NextPage } from "next";
import throttle from "lodash/throttle";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { motion, useDragControls } from "framer-motion";

import type { MouseEventHandler, ReactNode } from "react";
import { useMemo, useRef } from "react";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import FennSticker from "@/assets/stickers/fenn.png";
import ReedSticker from "@/assets/stickers/reed_for_map.png";
import Background from "@/assets/tickets/bg.svg";
import Foreground from "@/assets/tickets/fg.svg";

const MAX_ROTATION_DEG = 10;

const ticketWidth = 899;
const ticketHeight = 350;

const canvasWidth = 630;
const canvasHeight = 297;

function Ticket({
  children,
  draft = false,
}: {
  children?: ReactNode;
  draft?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> | undefined =
    useMemo(
      () =>
        draft
          ? undefined
          : throttle((e) => {
              const div = ref.current;
              if (!div) return;

              const cardRect = div.getBoundingClientRect();
              const cardCenterX = cardRect.left + canvasWidth / 2;
              const cardCenterY = cardRect.top + canvasHeight / 2;

              const mouseXRelativeToCard = e.clientX;
              const mouseYRelativeToCard = e.clientY;

              // These ratios will give values between -0.5 to 0.5
              const dx = (mouseXRelativeToCard - cardCenterX) / canvasWidth;
              const dy = (mouseYRelativeToCard - cardCenterY) / canvasHeight;

              const rotateY = dx * MAX_ROTATION_DEG;
              const rotateX = -dy * MAX_ROTATION_DEG;

              div.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
            }, 100),
      [draft],
    );

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> | undefined =
    useMemo(
      () =>
        draft
          ? undefined
          : () => {
              // reset transform to 0/0
              const div = ref.current;
              if (!div) return;
              div.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            },
      [draft],
    );

  return (
    <div
      className="relative mx-auto origin-center transform overflow-hidden transition-transform duration-100 ease-in-out will-change-transform"
      style={{ width: ticketWidth + "px", height: ticketHeight + "px" }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image className="absolute h-full w-full" src={Background} alt="" />
      <div className="absolute left-[27px] top-[27px] h-[297px] w-[630px]">
        {children}
      </div>
      <Image
        className="pointer-events-none absolute h-full w-full"
        src={Foreground}
        alt=""
      />
    </div>
  );
}

function Movable({
  children,
  className = "",
  initialX,
  initialY,
  width = 50,
  height = 50,
  drag = false,
}: {
  children?: ReactNode;
  className?: string;
  width?: number;
  height?: number;
  initialX?: number;
  initialY?: number;
  drag?: boolean;
}) {
  const controls = useDragControls();

  const x = initialX ?? Math.random() * (canvasWidth - width);
  const y = initialY ?? Math.random() * (canvasHeight - height);

  if (!drag) {
    return (
      <motion.div
        initial={{ x, y }}
        className={
          "pointer-events-none absolute left-0 top-0 cursor-none select-none " +
          className
        }
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x, y }}
      drag={drag}
      dragMomentum={false}
      dragControls={controls}
      dragConstraints={{
        top: -height / 2,
        bottom: canvasHeight - height / 2,
        right: canvasWidth - width / 2,
        left: -width / 2,
      }}
      dragElastic={0}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      whileHover={{ cursor: "grab" }}
      whileTap={{ cursor: "grabbing" }}
      whileDrag={{ scale: 1.05 }}
      className={"absolute left-0 top-0 " + className}
    >
      {children}
    </motion.div>
  );
}

function EventTitle({
  children,
  drag = false,
}: {
  children?: ReactNode;
  drag?: boolean;
}) {
  return (
    <Movable
      drag={drag}
      height={50}
      width={50}
      className="text-4xl font-semibold text-[#5e5e5e]"
    >
      {children}
    </Movable>
  );
}

function UserTag({
  children,
  drag = false,
}: {
  children?: ReactNode;
  drag?: boolean;
}) {
  return (
    <Movable
      drag={drag}
      height={50}
      width={50}
      className="text-5xl font-semibold text-[red]"
    >
      <span className="text-xl text-gray-800">Ticket for:</span>
      <br />
      {children}
    </Movable>
  );
}

function Sticker({
  image,
  drag = false,
}: {
  image: StaticImageData;
  drag?: boolean;
}) {
  return (
    <Movable
      drag={drag}
      className="h-[200px] w-[200px]"
      width={200}
      height={200}
    >
      <Image
        className="pointer-events-none h-[200px] w-[200px] select-none object-fill"
        draggable={false}
        src={image}
        alt=""
      />
    </Movable>
  );
}

const TicketPage: NextPage = () => {
  return (
    <>
      <Meta title="Virtual Ticket" description="Virtual Ticket" />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section
        className="flex min-h-[85vh] flex-grow"
        containerClassName="flex flex-col items-center text-center text-alveus-green"
      >
        <Heading>Draft mode</Heading>

        <Ticket draft>
          <Sticker image={FennSticker} drag></Sticker>
          <Sticker image={ReedSticker} drag></Sticker>
          <EventTitle drag>Fox Party Day</EventTitle>
          <UserTag drag>HellSatanX</UserTag>
        </Ticket>

        <div className="mb-12">TODO: add stickers, change user color</div>

        <Heading>Share mode</Heading>

        <Ticket>
          <Sticker image={FennSticker}></Sticker>
          <Sticker image={ReedSticker}></Sticker>
          <EventTitle>Fox Party Day</EventTitle>
          <UserTag>HellSatanX</UserTag>
        </Ticket>
      </Section>
    </>
  );
};

export default TicketPage;

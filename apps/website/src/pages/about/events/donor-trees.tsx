import { Dialog, DialogPanel } from "@headlessui/react";
import { type NextPage } from "next";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DONOR_NAMES,
  DONOR_TREES,
  type TreeAnnotation,
} from "@/data/donor-trees";

import { classes } from "@/utils/classes";

import Carousel from "@/components/content/Carousel";
import DonorTreePanel from "@/components/content/DonorTreePanel";
import DonorTreeSearch from "@/components/content/DonorTreeSearch";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconX from "@/icons/IconX";

import leafLeftImage1 from "@/assets/floral/leaf-left-1.png";
import leafLeftImage2 from "@/assets/floral/leaf-left-2.png";
import leafRightImage1 from "@/assets/floral/leaf-right-1.png";
import leafRightImage2 from "@/assets/floral/leaf-right-2.png";

type ActiveSelection = {
  treeId: number;
  annotation: TreeAnnotation;
};

function findAnnotationForName(name: string): ActiveSelection | null {
  for (const tree of DONOR_TREES) {
    const annotation = tree.annotations.find(
      (a) => a.name.toLowerCase() === name.toLowerCase(),
    );
    if (annotation) {
      return { treeId: tree.id, annotation };
    }
  }
  return null;
}

const DonorTreesPage: NextPage = () => {
  const [active, setActive] = useState<ActiveSelection | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const currentTree = DONOR_TREES[currentIndex]!;
  const currentActiveAnnotation =
    active?.treeId === currentTree.id ? active.annotation : null;

  // Refs to each carousel slide (keyed by tree id), so we can scroll a specific
  // tree into view and observe which one is currently centered.
  const slidesRef = useRef<Record<string, HTMLDivElement>>({});

  const scrollToTree = useCallback((treeId: number) => {
    slidesRef.current[String(treeId)]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, []);

  // The carousel owns the scroll position, so derive the current tree from
  // whichever slide is most visible (drives the counter, dots, keyboard nav,
  // and the fullscreen target).
  useEffect(() => {
    const slides = Object.entries(slidesRef.current);
    const root = slides[0]?.[1]?.parentElement;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;
        const id = slides.find(([, el]) => el === mostVisible.target)?.[0];
        const index = DONOR_TREES.findIndex((t) => String(t.id) === id);
        if (index >= 0) setCurrentIndex(index);
      },
      { root, threshold: [0.25, 0.5, 0.75, 1] },
    );
    for (const [, el] of slides) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelect = useCallback(
    (name: string) => {
      const found = findAnnotationForName(name);
      if (!found) return;
      setActive(found);
      scrollToTree(found.treeId);
    },
    [scrollToTree],
  );

  // Keyboard left/right navigation between trees
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrow keys while typing in the search (or any input)
      if (
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      )
        return;
      if (e.key === "ArrowLeft" && currentIndex > 0)
        scrollToTree(DONOR_TREES[currentIndex - 1]!.id);
      else if (e.key === "ArrowRight" && currentIndex < DONOR_TREES.length - 1)
        scrollToTree(DONOR_TREES[currentIndex + 1]!.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, scrollToTree]);

  // One panel per tree, all mounted so the carousel can scroll between them and
  // a searched name can be zoomed without remounting.
  const items = useMemo(
    () =>
      Object.fromEntries(
        DONOR_TREES.map((tree, i) => [
          String(tree.id),
          <DonorTreePanel
            key={tree.id}
            tree={tree}
            activeAnnotation={
              active?.treeId === tree.id ? active.annotation : null
            }
            current={i === currentIndex}
            onToggleFullscreen={() => setFullscreen(true)}
          />,
        ]),
      ),
    [active, currentIndex],
  );

  return (
    <>
      <Meta
        title="Donor Trees"
        description="Find your name on one of the Alveus donor recognition trees. Search for your name to see exactly where it appears on the tree."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <div className="relative">
        <Image
          src={leafRightImage1}
          alt=""
          className="pointer-events-none absolute -top-8 right-0 z-10 hidden h-auto w-1/2 max-w-sm drop-shadow-md select-none lg:block"
        />
        <Image
          src={leafLeftImage2}
          alt=""
          className="pointer-events-none absolute -bottom-24 left-0 z-10 hidden h-auto w-1/2 max-w-48 drop-shadow-md select-none lg:block"
        />

        <Section dark className="py-24">
          <Heading>Donor Trees</Heading>
          <p className="text-lg">
            Thank you to everyone who donated during our fundraising campaign.
            Your name is engraved on one of our six donor recognition trees at
            Alveus. Search for your name below to find where it appears.
          </p>
        </Section>
      </div>

      <div className="relative flex grow flex-col">
        <Image
          src={leafLeftImage1}
          alt=""
          className="pointer-events-none absolute -bottom-32 -left-8 z-10 hidden h-auto w-1/2 max-w-40 -rotate-45 drop-shadow-md select-none lg:block 2xl:max-w-48"
        />
        <Image
          src={leafRightImage2}
          alt=""
          className="pointer-events-none absolute right-0 -bottom-60 z-10 hidden h-auto w-1/2 max-w-40 drop-shadow-md select-none lg:block 2xl:-bottom-64 2xl:max-w-48"
        />

        <Section className="grow">
        {/* Drag is disabled so panning a tree doesn't scroll the carousel;
            trees are changed via the arrows, dots, keyboard, or search. */}
        <Carousel
          items={items}
          auto={null}
          draggable={false}
          className="mx-auto max-w-5xl items-center"
          itemClassName="basis-full p-1"
          buttonClassName="text-alveus-green-800 transition-colors hover:text-alveus-green-500"
          itemsRef={slidesRef}
        />

        <div className="mx-auto mt-4 flex max-w-5xl flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {DONOR_TREES.map((tree, i) => (
              <button
                key={tree.id}
                type="button"
                onClick={() => scrollToTree(tree.id)}
                aria-label={`Tree ${tree.id}`}
                aria-current={i === currentIndex ? "true" : undefined}
                className={classes(
                  "size-2.5 rounded-full transition-colors",
                  i === currentIndex
                    ? "scale-125 bg-alveus-green-800"
                    : "bg-alveus-green-300 hover:bg-alveus-green-500",
                )}
              />
            ))}
          </div>
          <p className="text-base text-alveus-green-700">
            Tree {currentIndex + 1} of {DONOR_TREES.length}
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-2xl">
          <DonorTreeSearch names={DONOR_NAMES} onSelect={handleSelect} />
        </div>
        </Section>
      </div>

      {/* Fullscreen overlay — an in-page Dialog (not the browser Fullscreen
          API) hosting a fill-the-viewport copy of the current tree. Re-keyed
          per tree so it re-fits when opened or navigated. */}
      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        className="relative z-100"
      >
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 p-4 md:p-8">
          <DialogPanel className="relative size-full">
            <DonorTreePanel
              key={`fullscreen-${currentTree.id}`}
              tree={currentTree}
              activeAnnotation={currentActiveAnnotation}
              onToggleFullscreen={() => setFullscreen(false)}
              fullscreen
            />
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Exit fullscreen"
              className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <IconX className="size-5" />
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default DonorTreesPage;

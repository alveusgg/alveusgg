import { Dialog, DialogPanel } from "@headlessui/react";
import { type NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

import {
  DONOR_NAMES,
  DONOR_TREES,
  type TreeAnnotation,
} from "@/data/donor-trees";

import { classes } from "@/utils/classes";

import DonorTreePanel from "@/components/content/DonorTreePanel";
import DonorTreeSearch from "@/components/content/DonorTreeSearch";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";
import IconX from "@/icons/IconX";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [active, setActive] = useState<ActiveSelection | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const currentTree = DONOR_TREES[currentIndex]!;
  const currentActiveAnnotation =
    active?.treeId === currentTree.id ? active.annotation : null;

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setActive(null);
  }, []);

  const goPrev = useCallback(
    () => goTo(Math.max(0, currentIndex - 1)),
    [goTo, currentIndex],
  );

  const goNext = useCallback(
    () => goTo(Math.min(DONOR_TREES.length - 1, currentIndex + 1)),
    [goTo, currentIndex],
  );

  // Keyboard left/right navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack arrow keys while typing in the search (or any input)
      if (
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      )
        return;
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const handleSelect = useCallback((name: string) => {
    const found = findAnnotationForName(name);
    if (!found) return;
    const index = DONOR_TREES.findIndex((t) => t.id === found.treeId);
    setCurrentIndex(index);
    setActive(found);
  }, []);

  return (
    <>
      <Meta
        title="Donor Trees"
        description="Find your name on one of the Alveus donor recognition trees. Search for your name to see exactly where it appears on the tree."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section dark className="z-10 py-24">
        <Heading>Donor Trees</Heading>
        <p className="text-lg">
          Thank you to everyone who donated during our fundraising campaign.
          Your name is engraved on one of our six donor recognition trees at
          Alveus. Search for your name below to find where it appears.
        </p>

        <div className="mt-8 max-w-xl">
          <DonorTreeSearch names={DONOR_NAMES} onSelect={handleSelect} />
        </div>
      </Section>

      <Section className="grow">
        {/* Gallery navigation header — width-matched to the panel below */}
        <div className="mx-auto mb-4 flex w-full max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-alveus-green-800 transition-colors hover:bg-alveus-green-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous tree"
          >
            <IconChevronLeft className="size-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {DONOR_TREES.map((tree, i) => (
              <button
                key={tree.id}
                type="button"
                onClick={() => goTo(i)}
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

          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === DONOR_TREES.length - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-alveus-green-800 transition-colors hover:bg-alveus-green-100 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next tree"
          >
            Next
            <IconChevronRight className="size-4" />
          </button>
        </div>

        {/* Single tree panel — key resets zoom/pan state on navigation */}
        <div className="mx-auto max-w-5xl">
          <DonorTreePanel
            key={currentTree.id}
            tree={currentTree}
            activeAnnotation={currentActiveAnnotation}
            onToggleFullscreen={() => setFullscreen(true)}
          />
        </div>

        <p className="mt-3 text-center text-base text-alveus-green-700">
          Tree {currentIndex + 1} of {DONOR_TREES.length}
        </p>
      </Section>

      {/* Fullscreen overlay — an in-page Dialog (not the browser Fullscreen
          API) hosting a fill-the-viewport copy of the panel. Re-keyed per tree
          so it re-fits when opened or navigated. */}
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

import type { ImageProps } from "next/image";
import Image from "next/image";

import Heading from "../content/Heading";
import Link from "../content/Link";

const Wolves = ({
  children,
  image,
}: {
  children?: React.ReactNode;
  image: { src: ImageProps["src"]; alt: string };
}) => (
  <>
    <div className="@container relative my-4 grid w-full auto-rows-fr grid-cols-1 gap-4">
      <Image
        src={image.src}
        width={240}
        alt={image.alt}
        className="pointer-events-none absolute top-1/2 right-0 z-10 aspect-square size-40 translate-x-1/2 -translate-y-1/2 rounded-full border-12 border-alveus-green object-cover @md:size-60 @md:border-16"
      />

      <div className="relative rounded-r-xl bg-red py-2 pr-20 before:absolute before:inset-y-0 before:-left-full before:w-full before:bg-red @md:pr-30">
        <Heading level={-1}>
          <span className="mr-1 inline-block text-6xl tabular-nums">
            <span className="opacity-10 select-none">0</span>18
          </span>{" "}
          Red wolves exist in the wild today.{" "}
          <Link
            href="#wolf-sources"
            custom
            className="text-xs opacity-50 transition-colors hover:text-blue-300 hover:underline"
          >
            [1]
          </Link>
        </Heading>
      </div>

      <div className="relative rounded-r-xl bg-red py-2 pr-20 before:absolute before:inset-y-0 before:-left-full before:w-full before:bg-red @md:pr-30">
        <Heading level={-1}>
          <span className="mr-1 inline-block text-6xl tabular-nums">286</span>{" "}
          Mexican Gray wolves exist in the wild today.{" "}
          <Link
            href="#wolf-sources"
            custom
            className="text-xs opacity-50 transition-colors hover:text-blue-300 hover:underline"
          >
            [2]
          </Link>
        </Heading>
      </div>
    </div>

    {children}

    <ul className="mt-4 text-left text-xs opacity-75" id="wolf-sources">
      <li className="mb-1">
        [1]{" "}
        <Link
          external
          href="https://www.fws.gov/project/red-wolf-recovery-program"
          dark
        >
          U.S. Fish & Wildlife Service Red Wolf Recovery Program Update - August
          2025
        </Link>
      </li>
      <li className="mb-1">
        [2]{" "}
        <Link
          external
          href="https://www.fws.gov/media/name-mexican-wolf-recovery-program-quarterly-update-second-quarter-2025"
          dark
        >
          U.S. Fish & Wildlife Service Mexican Wolf Recovery Program Quarterly
          Update - Second Quarter 2025
        </Link>
      </li>
    </ul>
  </>
);

export default Wolves;

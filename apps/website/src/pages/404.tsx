import { type NextPage } from "next";
import React from "react";

import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";
import Section from "@/components/content/Section";

// TODO: remove this!
import IconGlobe from "@/icons/IconGlobe";
import IconPencil from "@/icons/IconPencil";
import IconSync from "@/icons/IconSync";
import IconXCircle from "@/icons/IconXCircle";
import IconTrash from "@/icons/IconTrash";
import IconEye from "@/icons/IconEye";
import IconShare from "@/icons/IconShare";
import IconEllipsis from "@/icons/IconEllipsis";
import IconWarningTriangle from "@/icons/IconWarningTriangle";
import IconPlus from "@/icons/IconPlus";
import IconDownload from "@/icons/IconDownload";
import IconUpload from "@/icons/IconUpload";
import IconBellAlert from "@/icons/IconBellAlert";
import IconMinusCircle from "@/icons/IconMinusCircle";
import IconArchive from "@/icons/IconArchive";
import IconBolt from "@/icons/IconBolt";
import IconXCircleOutline from "@/icons/IconXCircleOutline";
import IconVideoCamera from "@/icons/IconVideoCamera";
import IconMinus from "@/icons/IconMinus";
import IconCheckCircle from "@/icons/IconCheckCircle";
import IconCheck from "@/icons/IconCheck";
import IconTimes from "@/icons/IconTimes";
import IconMenu from "@/icons/IconMenu";
import IconInformationCircle from "@/icons/IconInformationCircle";
import IconUploadFiles from "@/icons/IconUploadFiles";
import IconArrowUp from "@/icons/IconArrowUp";
import IconArrowDown from "@/icons/IconArrowDown";
import IconArrowsIn from "@/icons/IconArrowsIn";
import IconArrowsOut from "@/icons/IconArrowsOut";

const NotFound: NextPage = () => {
  return (
    <>
      <Meta
        title="404 - Page Not Found"
        description="The page you are looking could not be found."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Heading>404 - Page Not Found</Heading>
      </Section>

      {/* TODO: remove this! */}
      <IconGlobe className="h-20 w-20 text-red-500" />
      <IconSync className="h-20 w-20 text-red-500" />
      <IconPencil className="h-20 w-20 text-red-500" />
      <IconXCircle className="h-20 w-20 text-red-500" />
      <IconTrash className="h-20 w-20 text-red-500" />
      <IconEye className="h-20 w-20 text-red-500" />
      <IconShare className="h-20 w-20 text-red-500" />
      <IconEllipsis className="h-20 w-20 text-red-500" />
      <IconWarningTriangle className="h-20 w-20 text-red-500" />
      <IconPlus className="h-20 w-20 text-red-500" />
      <IconDownload className="h-20 w-20 text-red-500" />
      <IconUpload className="h-20 w-20 text-red-500" />
      <IconBellAlert className="h-20 w-20 text-red-500" />
      <IconMinusCircle className="h-20 w-20 text-red-500" />
      <IconArchive className="h-20 w-20 text-red-500" />
      <IconBolt className="h-20 w-20 text-red-500" />
      <IconXCircleOutline className="h-20 w-20 text-red-500" />
      <IconVideoCamera className="h-20 w-20 text-red-500" />
      <IconMinus className="h-20 w-20 text-red-500" />
      <IconCheckCircle className="h-20 w-20 text-red-500" />
      <IconCheck className="h-20 w-20 text-red-500" />
      <IconTimes className="h-20 w-20 text-red-500" />
      <IconMenu className="h-20 w-20 text-red-500" />
      <IconInformationCircle className="h-20 w-20 text-red-500" />
      <IconUploadFiles className="h-20 w-20 text-red-500" />
      <IconArrowUp className="h-20 w-20 text-red-500" />
      <IconArrowDown className="h-20 w-20 text-red-500" />
      <IconArrowsIn className="h-20 w-20 text-red-500" />
      <IconArrowsOut className="h-20 w-20 text-red-500" />
    </>
  );
};

export default NotFound;

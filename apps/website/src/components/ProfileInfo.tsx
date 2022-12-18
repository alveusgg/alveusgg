import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

export const ProfileInfo: React.FC<{ full?: boolean }> = ({ full = false }) => {
  const { data: sessionData } = useSession();

  if (sessionData) {
    return (
      <div
        className={`flex items-center gap-4 ${
          full ? "w-full justify-between" : ""
        }`}
      >
        <span className={`${full ? "" : "hidden md:block"}`}>
          {sessionData.user?.name}
        </span>
        {sessionData.user?.image && (
          <Image
            src={sessionData.user.image}
            alt=""
            width="150"
            height="150"
            className="h-8 w-8 overflow-hidden rounded-full"
          />
        )}
      </div>
    );
  }

  return <></>;
};

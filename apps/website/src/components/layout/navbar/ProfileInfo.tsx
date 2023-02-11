import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

export const ProfileInfo: React.FC<{ full?: boolean }> = ({ full = false }) => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (user) {
    return (
      <div
        className={`flex items-center gap-4 ${
          full ? "w-full justify-between" : ""
        }`}
      >
        {full && <span>{user.name}</span>}
        {user.image && (
          <Image
            src={user.image}
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

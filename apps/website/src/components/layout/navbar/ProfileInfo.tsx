import { useSession } from "next-auth/react";
import React from "react";

export const ProfileInfo: React.FC<{ full?: boolean }> = ({ full = false }) => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (user) {
    return (
      <div className={`flex items-center gap-4 ${full ? "min-w-max w-full justify-between" : ""}`}>
        {full && <span>{user.name}</span>}
        {user.image && (
          // NOTE: Profile avatars make little sense to be optimized as they are only
          //       shown to the user and are probably already cached in their browser
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="h-8 w-8 overflow-hidden rounded-full"
          />
        )}
      </div>
    );
  }

  return <></>;
};

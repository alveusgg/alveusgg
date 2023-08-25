import { useSession } from "next-auth/react";
import { type FC } from "react";

export const ProfileInfoImage: FC = () => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (user?.image) {
    return (
      // NOTE: Profile avatars make little sense to be optimized as they are only
      //       shown to the user and are probably already cached in their browser
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        className="h-8 w-8 overflow-hidden rounded-full"
      />
    );
  }

  return <></>;
};

export const ProfileInfo: FC<{ full?: boolean }> = ({ full = false }) => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (user) {
    return (
      <div
        className={`flex items-center gap-8 ${
          full ? "w-full min-w-max justify-between" : ""
        }`}
      >
        {full && <span>{user.name}</span>}
        <ProfileInfoImage />
      </div>
    );
  }

  return <></>;
};

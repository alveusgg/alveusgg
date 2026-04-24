import { useSession } from "next-auth/react";

import { classes } from "@/utils/classes";

export const ProfileInfoImage = () => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (!user?.image) {
    return;
  }

  return (
    // NOTE: Profile avatars make little sense to be optimized as they are only
    //       shown to the user and are probably already cached in their browser
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.image}
      alt=""
      className="size-8 overflow-hidden rounded-full"
    />
  );
};

export const ProfileInfo = ({ full = false }) => {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  if (!user) {
    return;
  }

  return (
    <div
      className={classes(
        "flex items-center gap-8",
        full && "w-full min-w-max justify-between",
      )}
    >
      {full && <span>{user.name}</span>}
      <ProfileInfoImage />
    </div>
  );
};

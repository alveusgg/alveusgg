import { useSession } from "next-auth/react";
import Image from "next/image";

export const ProfileInfo: React.FC = () => {
  const { data: sessionData } = useSession();

  if (sessionData) {
    return (
      <div className="flex items-center gap-4">
        <span>{sessionData.user?.name}</span>
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

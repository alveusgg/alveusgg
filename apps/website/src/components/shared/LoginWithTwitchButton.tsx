import { signIn } from "next-auth/react";
import IconTwitch from "../../icons/IconTwitch";
import { Button } from "./Button";

type LoginWithTwitchButtonProps = {
  callbackUrl?: string;
};

export function LoginWithTwitchButton({
  callbackUrl,
}: LoginWithTwitchButtonProps) {
  return (
    <Button
      className="bg-[#6441a5] text-white"
      onClick={() => signIn("twitch", { callbackUrl })}
    >
      <IconTwitch />
      <span>Log in</span>
    </Button>
  );
}

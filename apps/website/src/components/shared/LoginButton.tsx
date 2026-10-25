import { signIn } from "next-auth/react";

import IconSignIn from "@/icons/IconSignIn";

import { Button } from "./form/Button";

type LoginButtonProps = {
  callbackUrl?: string;
};

export function LoginButton({ callbackUrl }: LoginButtonProps) {
  return (
    <Button
      onClick={() =>
        signIn(undefined, { callbackUrl: callbackUrl ?? window.location.href })
      }
    >
      <IconSignIn />
      <span>Log in</span>
    </Button>
  );
}

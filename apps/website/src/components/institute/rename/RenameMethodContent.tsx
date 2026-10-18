import type { Session } from "next-auth";

import type { MuralId } from "@/data/murals";

import { EditExternalPixels } from "@/components/institute/EditExternalPixels";
import { EditMyPixels } from "@/components/institute/EditMyPixels";
import { EditNeonPixels } from "@/components/institute/EditNeonPixels";
import { LoginWithTwitchButton } from "@/components/shared/LoginWithTwitchButton";
import { MessageBox } from "@/components/shared/MessageBox";

import { RenameStepsLayout } from "./RenameStep";
import { type RenameMethodId, getRenameReturnTo } from "./methods";

export type RenameMethodState = {
  user: Session["user"] | undefined;
  neon: { isEnabled: boolean; isLoggedIn: boolean; hasLoginFailed: boolean };
};

/**
 * Steps 3 and 4 for the chosen method.
 */
export function RenameMethodContent({
  method,
  muralId,
  state,
}: {
  method: RenameMethodId;
  muralId: MuralId;
  state: RenameMethodState;
}) {
  switch (method) {
    case "twitch":
      return state.user ? (
        <EditMyPixels key={muralId} muralId={muralId} user={state.user} />
      ) : (
        <RenameStepsLayout
          confirm={
            <MessageBox>
              <p className="mb-4">
                Log in with the Twitch account you donated with to see all
                pixels unlocked by your Twitch Charity donations.
              </p>

              <LoginWithTwitchButton
                callbackUrl={getRenameReturnTo(muralId, method)}
              />
            </MessageBox>
          }
          rename={null}
          renamePlaceholder="Log in with Twitch first."
        />
      );
    case "website":
      return (
        <EditNeonPixels
          key={muralId}
          muralId={muralId}
          isLoggedIn={state.neon.isLoggedIn}
          hasLoginFailed={state.neon.hasLoginFailed}
          returnTo={getRenameReturnTo(muralId, method)}
        />
      );
    case "receipt":
      return <EditExternalPixels key={muralId} muralId={muralId} />;
  }
}

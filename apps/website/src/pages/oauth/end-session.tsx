import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { z } from "zod";

import { getOAuthClient, isAllowedRedirectUri } from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";

type EndSessionPageProps = {
  error?: string;
};

const EndSessionRequestSchema = z.object({
  client_id: z.string().min(1),
  post_logout_redirect_uri: z.string().min(1),
  state: z.string().optional(),
});

function getAuthorizeRequestError(error: z.ZodError) {
  const issue = error.issues[0];
  const [field] = issue?.path ?? [];

  if (
    typeof field === "string" &&
    (issue?.code === "invalid_type" || issue?.code === "too_small")
  ) {
    return `Missing ${field}.`;
  }

  return issue?.message ?? "Invalid OAuth request.";
}

export const getServerSideProps: GetServerSideProps<
  EndSessionPageProps
> = async (context) => {
  try {
    if (!hasOAuthSigningKey()) {
      throw new Error("OAuth signing key is not configured.");
    }

    const result = EndSessionRequestSchema.safeParse(context.query);
    if (!result.success) {
      throw new Error(getAuthorizeRequestError(result.error));
    }

    const {
      client_id: clientId,
      post_logout_redirect_uri: postLogoutRedirectUri,
      state,
    } = result.data;

    if (!getOAuthClient(clientId)) {
      throw new Error("Invalid client_id.");
    }

    if (!isAllowedRedirectUri(clientId, postLogoutRedirectUri)) {
      throw new Error("Invalid client_id or post_logout_redirect_uri.");
    }

    const destination = new URL(postLogoutRedirectUri);
    if (state) {
      destination.searchParams.set("state", state);
    }

    return {
      redirect: {
        permanent: false,
        destination: `/auth/signout?callbackUrl=${encodeURIComponent(destination.toString())}`,
      },
    };
  } catch (error) {
    return {
      props: {
        error:
          error instanceof Error ? error.message : "Invalid OAuth request.",
      },
    };
  }
};

export default function EndSessionPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return <main>{props.error ?? "Redirecting..."}</main>;
}

import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { z } from "zod";

import { getServerAuthSession } from "@/server/common/get-server-auth-session";
import { issueAuthorizationCode } from "@/server/oauth/codes";
import {
  OAUTH_CODE_CHALLENGE_METHOD,
  getOAuthClient,
  isAllowedRedirectUri,
} from "@/server/oauth/config";
import { hasOAuthSigningKey } from "@/server/oauth/keys";

type AuthorizePageProps = {
  error?: string;
};

const AuthorizeRequestSchema = z.object({
  response_type: z.literal(["code"]),
  client_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  code_challenge: z.string().min(1),
  code_challenge_method: z.literal(OAUTH_CODE_CHALLENGE_METHOD),
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
  AuthorizePageProps
> = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (!session?.user?.id) {
    return {
      redirect: {
        permanent: false,
        destination: `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}&mode=oauth`,
      },
    };
  }

  try {
    if (!hasOAuthSigningKey()) {
      throw new Error("OAuth signing key is not configured.");
    }

    const result = AuthorizeRequestSchema.safeParse(context.query);
    if (!result.success) {
      throw new Error(getAuthorizeRequestError(result.error));
    }

    const {
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      state,
    } = result.data;

    if (!getOAuthClient(clientId)) {
      throw new Error("Invalid client_id.");
    }

    if (!isAllowedRedirectUri(clientId, redirectUri)) {
      throw new Error("Invalid client_id or redirect_uri.");
    }

    const code = await issueAuthorizationCode({
      subject: session.user.id,
      clientId,
      redirectUri,
      codeChallenge,
    });
    const destination = new URL(redirectUri);
    destination.searchParams.set("code", code);
    if (state) {
      destination.searchParams.set("state", state);
    }

    return {
      redirect: {
        permanent: false,
        destination: destination.toString(),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        error:
          error instanceof Error ? error.message : "Invalid OAuth request.",
      },
    };
  }
};

export default function AuthorizePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return <main>{props.error ?? "Redirecting..."}</main>;
}

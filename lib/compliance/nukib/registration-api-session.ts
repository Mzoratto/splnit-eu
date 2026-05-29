import { auth } from "@clerk/nextjs/server";

export const NUKIB_REGISTRATION_TEST_ORG_ID = "org_e2e_nukib_registration";
export const NUKIB_REGISTRATION_TEST_USER_ID = "user_e2e_nukib_registration";
const NUKIB_REGISTRATION_TEST_ORG_HEADER = "x-nukib-registration-test-org-id";

export type NukibRegistrationApiSession = {
  mode: "clerk" | "test";
  orgId: string;
  userId: string;
};

export function hasNukibRegistrationClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

export function isNukibRegistrationTestApiEnabled() {
  return (
    process.env.NUKIB_REGISTRATION_TEST_MODE === "true" &&
    process.env.ENABLE_TEST_ROUTES === "true" &&
    process.env.ENABLE_LOCAL_DEMO_DATA === "true"
  );
}

function getTestOrgId(request?: Request) {
  const requestedOrgId = request?.headers
    .get(NUKIB_REGISTRATION_TEST_ORG_HEADER)
    ?.trim();

  if (
    requestedOrgId &&
    /^org_e2e_nukib_registration[a-zA-Z0-9_-]{0,80}$/.test(requestedOrgId)
  ) {
    return requestedOrgId;
  }

  return NUKIB_REGISTRATION_TEST_ORG_ID;
}

export async function getNukibRegistrationApiSession(
  request?: Request,
): Promise<NukibRegistrationApiSession | null> {
  if (isNukibRegistrationTestApiEnabled()) {
    return {
      mode: "test",
      orgId: getTestOrgId(request),
      userId: NUKIB_REGISTRATION_TEST_USER_ID,
    };
  }

  if (!hasNukibRegistrationClerkConfig()) {
    return null;
  }
  const session = await auth();

  if (!session?.userId || !session.orgId) {
    return null;
  }

  return {
    mode: "clerk",
    orgId: session.orgId,
    userId: session.userId,
  };
}

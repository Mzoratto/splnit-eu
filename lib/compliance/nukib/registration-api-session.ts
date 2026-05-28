import { auth } from "@clerk/nextjs/server";

export const NUKIB_REGISTRATION_TEST_ORG_ID = "org_e2e_nukib_registration";
export const NUKIB_REGISTRATION_TEST_USER_ID = "user_e2e_nukib_registration";

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
    process.env.ENABLE_TEST_ROUTES === "true" &&
    process.env.ENABLE_LOCAL_DEMO_DATA === "true"
  );
}

export async function getNukibRegistrationApiSession(): Promise<
  NukibRegistrationApiSession | null
> {
  if (!hasNukibRegistrationClerkConfig()) {
    if (!isNukibRegistrationTestApiEnabled()) {
      return null;
    }

    return {
      mode: "test",
      orgId: NUKIB_REGISTRATION_TEST_ORG_ID,
      userId: NUKIB_REGISTRATION_TEST_USER_ID,
    };
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

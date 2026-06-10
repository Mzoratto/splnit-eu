import { SignUp } from "@clerk/nextjs";
import { getLocale } from "next-intl/server";
import { AuthLogoLink } from "@/components/auth/auth-logo-link";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";

export default async function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
    const copy = getMessagesForLocale(locale).authFallback;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-5">
        <AuthLogoLink />
        <div className="max-w-md rounded-lg border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground/66">
            {copy.signUpBody}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-5">
      <AuthLogoLink />
      <SignUp fallbackRedirectUrl="/dashboard" />
    </main>
  );
}

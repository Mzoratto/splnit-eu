import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="grid min-h-screen place-items-center px-5">
        <div className="max-w-md rounded-lg border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold">Clerk není nakonfigurovaný</h1>
          <p className="mt-2 text-sm leading-6 text-foreground/66">
            Přidejte Clerk klíče do .env.local pro aktivaci registrace a
            organizací.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <SignUp />
    </main>
  );
}

import { ClerkThemeProvider } from "@/components/app/clerk-theme-provider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return children;
  }

  return <ClerkThemeProvider>{children}</ClerkThemeProvider>;
}

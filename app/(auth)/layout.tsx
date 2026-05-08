import type { Metadata } from "next";
import { ClerkThemeProvider } from "@/components/app/clerk-theme-provider";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return children;
  }

  return <ClerkThemeProvider>{children}</ClerkThemeProvider>;
}

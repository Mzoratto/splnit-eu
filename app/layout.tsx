import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://splnit.eu",
  ),
  title:
    "Splnit.eu — Automatizace souladu s NIS2, EU AI Act a GDPR pro české firmy",
  description:
    "Splnit.eu propojí vaše systémy, prověří bezpečnostní kontroly každou hodinu a udržuje vás v souladu s NIS2, EU AI Act, GDPR a ISO 27001.",
  openGraph: {
    locale: "cs_CZ",
    title: "Splnit.eu — Compliance automatizace pro české firmy",
    description:
      "Splňte NIS2, EU AI Act a GDPR automaticky. 200+ testů každou hodinu.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Splnit.eu compliance automation dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Splnit.eu — Compliance automatizace pro české firmy",
    description:
      "Splňte NIS2, EU AI Act a GDPR automaticky. 200+ testů každou hodinu.",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const shell = (
    <html
      lang={locale}
      className={`${dmSans.variable} ${dmMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return shell;
  }

  return <ClerkProvider>{shell}</ClerkProvider>;
}

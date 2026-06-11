import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieConsent } from "@/components/cookie-consent";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getAppUrl } from "@/lib/env";
import {
  cookieConsentName,
  type CookieConsentValue,
} from "@/lib/privacy/cookie-consent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "optional",
  preload: true,
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "optional",
  preload: true,
});

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("splnit-theme");
    const theme = stored === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const savedLocale = window.localStorage.getItem("splnit_locale");
    const supportedLocales = new Set(["cs-CZ", "en-EU", "it-IT"]);
    const hasLocaleCookie = /(?:^|; )NEXT_LOCALE=/.test(document.cookie);
    if (savedLocale && supportedLocales.has(savedLocale) && !hasLocaleCookie) {
      document.cookie = "NEXT_LOCALE=" + savedLocale + "; path=/; max-age=31536000; SameSite=Lax";
    }
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

function normalizeCookieConsent(
  value: string | undefined,
): CookieConsentValue | null {
  return value === "accepted" || value === "rejected" ? value : null;
}

const metadataCopy: Record<
  Locale,
  {
    description: string;
    locale: string;
    title: string;
  }
> = {
  "cs-CZ": {
    description:
      "Splnit.eu propojí Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud a české ERP workspaces pro auditní důkazy NIS2, GDPR a ISO 27001.",
    locale: "cs_CZ",
    title: "Splnit.eu — Compliance automatizace pro evropské SMB týmy",
  },
  "en-EU": {
    description:
      "Connect Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, and Czech ERP workspaces to prepare audit evidence for NIS2, GDPR, and ISO 27001.",
    locale: "en_EU",
    title: "Splnit.eu — Compliance automation for European SMB teams",
  },
  "it-IT": {
    description:
      "Collega Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud e workspace ERP cechi per preparare evidenze audit per NIS2, GDPR e ISO 27001.",
    locale: "it_IT",
    title: "Splnit.eu — Automazione compliance per PMI europee",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = metadataCopy[locale];

  return {
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Splnit.eu",
    },
    applicationName: "Splnit.eu",
    description: copy.description,
    icons: {
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(getAppUrl()),
    openGraph: {
      description: copy.description,
      images: [
        {
          alt: "Splnit.eu compliance automation dashboard",
          height: 630,
          url: "/opengraph-image",
          width: 1200,
        },
      ],
      locale: copy.locale,
      title: copy.title,
      type: "website",
    },
    title: copy.title,
    twitter: {
      card: "summary_large_image",
      description: copy.description,
      images: ["/opengraph-image"],
      title: copy.title,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const initialCookieConsent = normalizeCookieConsent(
    cookieStore.get(cookieConsentName)?.value,
  );

  return (
    <html
      lang={locale}
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${jetBrainsMono.variable} h-full scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RegisterServiceWorker />
          {children}
          <CookieConsent initialConsent={initialCookieConsent} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

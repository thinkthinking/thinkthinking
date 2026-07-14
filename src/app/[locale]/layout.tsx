import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Geist_Mono,
  Jost,
  Oswald,
  Noto_Sans_SC,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { routing } from "@/i18n/routing";
import "../globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL("https://thinkthinking.ai"),
    title: t("title"),
    description: t("description"),
    keywords: [
      "thinkthinking",
      "ZenMux",
      "AgentOS",
      "Agent Harness",
      "AI product manager",
      "Token Economics",
    ],
    alternates: {
      canonical: locale === "en" ? "/" : "/zh",
      languages: { "zh-CN": "/zh", en: "/", "x-default": "/" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "en" ? "https://thinkthinking.ai" : "https://thinkthinking.ai/zh",
      siteName: "thinkthinking",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
      creator: "@thinkthinking_",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${oswald.variable} ${notoSansSC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Geist_Mono,
  Jost,
  Fraunces,
  Archivo_Black,
  Noto_Serif_SC,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Field-guide type system (mirrors the ZenMux Arena editorial voice):
//  · Jost — geometric sans; small-caps metadata and body copy.
//  · Fraunces italic — the specimen captions and margin notes.
//  · Noto Serif SC — CJK companion for Fraunces so Chinese notes stay serif.
//  · Archivo Black — the giant outlined display type.
//  · Geist Mono — fact lines and fine print.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
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
      canonical: locale === "zh" ? "/" : "/en",
      languages: { "zh-CN": "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "zh" ? "https://thinkthinking.ai" : "https://thinkthinking.ai/en",
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
      className={`${jost.variable} ${fraunces.variable} ${notoSerifSC.variable} ${archivoBlack.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

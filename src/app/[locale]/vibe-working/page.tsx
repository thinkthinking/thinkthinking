import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  VibeWorkingExperience,
  type Chapter,
  type ExperienceLabels,
  type SceneLabels,
} from "./vibe-working-experience";

const CHAPTER_IDS = [
  "origin",
  "bottleneck",
  "opc",
  "collaboration",
  "artifacts",
  "organization",
  "judgment",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vibeWorking.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "en" ? "/vibe-working" : "/zh/vibe-working",
      languages: {
        "zh-CN": "/zh/vibe-working",
        en: "/vibe-working",
        "x-default": "/vibe-working",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url:
        locale === "en"
          ? "https://thinkthinking.ai/vibe-working"
          : "https://thinkthinking.ai/zh/vibe-working",
      type: "article",
    },
  };
}

export default async function VibeWorkingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("vibeWorking");
  const chapters: Chapter[] = CHAPTER_IDS.map((id) => ({
    id,
    eyebrow: t(`chapters.${id}.eyebrow`),
    title: t(`chapters.${id}.title`),
    body: t.raw(`chapters.${id}.body`) as string[],
    takeaway: t(`chapters.${id}.takeaway`),
  }));

  const labels: ExperienceLabels = {
    back: t("nav.back"),
    talks: t("nav.talks"),
    title: t("nav.title"),
    chapter: t("nav.chapter"),
    previous: t("nav.previous"),
    next: t("nav.next"),
    finish: t("nav.finish"),
    replay: t("nav.replay"),
    keyboardHint: t("nav.keyboardHint"),
    sourceNote: t("nav.sourceNote"),
  };

  return (
    <VibeWorkingExperience
      locale={locale}
      chapters={chapters}
      labels={labels}
      scenes={t.raw("scenes") as SceneLabels}
    />
  );
}

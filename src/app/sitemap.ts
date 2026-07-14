import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: "https://thinkthinking.ai",
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: { "zh-CN": "https://thinkthinking.ai/zh", en: "https://thinkthinking.ai" },
      },
    },
    {
      url: "https://thinkthinking.ai/zh",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: { "zh-CN": "https://thinkthinking.ai/zh", en: "https://thinkthinking.ai" },
      },
    },
  ];
}

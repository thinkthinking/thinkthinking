import { defineRouting } from "next-intl/routing";

// English is the default at "/"; Chinese is explicitly available at "/zh".
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});

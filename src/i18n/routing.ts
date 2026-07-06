import { defineRouting } from "next-intl/routing";

// zh is the default and lives at "/", English at "/en".
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "as-needed",
});

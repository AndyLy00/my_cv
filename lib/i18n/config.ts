export const locales = ["en", "ro", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ro: "Română",
  ru: "Русский",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

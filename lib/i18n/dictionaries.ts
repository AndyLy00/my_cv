import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import type { Dictionary } from "./en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.default),
  ro: () => import("./ro").then((m) => m.default),
  ru: () => import("./ru").then((m) => m.default),
};

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(locale?: Locale) {
  return dictionaries[locale ?? (await getLocale())]();
}

export type { Dictionary };

import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export default async function NotFound() {
  const lang = await getLocale();
  const dict = await getDictionary(lang);
  return (
    <main id="main" className="container-x grid min-h-[80dvh] place-items-center text-center">
      <div>
        <p className="accent text-[8rem] leading-none sm:text-[12rem]">404</p>
        <h1 className="mt-4 text-3xl font-semibold">{dict.notFound.title}</h1>
        <p className="mt-2 text-muted">{dict.notFound.text}</p>
        <Link href={`/${lang}`} className="btn btn-primary mt-8">{dict.notFound.home}</Link>
      </div>
    </main>
  );
}

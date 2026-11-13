import Link from "next/link";
import { TOOLS, SITE, SCHOOL_FINDER } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { Ar, JsonLd } from "@/components/ui";

export const metadata = pageMetadata({
  path: "/",
  title: "Islamic Ḥisāb: Zakat, inheritance, fidya and kaffārah calculators",
  description: SITE.description,
  absoluteTitle: true,
});

const SCHOOLS = [
  { name: "Ḥanafī", ar: "حنفي" },
  { name: "Mālikī", ar: "مالكي" },
  { name: "Shāfiʿī", ar: "شافعي" },
  { name: "Ḥanbalī", ar: "حنبلي" },
  { name: "Jaʿfarī", ar: "جعفري" },
];

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Islamic calculators",
          itemListElement: TOOLS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${t.title} calculator`,
            url: SITE.url + t.href,
          })),
        }}
      />

      <section className="container pt-10 pb-10 sm:pt-16 sm:pb-14">
        <p className="mb-5 text-[26px] sm:text-[30px] text-text-2">
          <Ar>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Ar>
        </p>
        <h1 className="text-[34px] sm:text-[52px] font-bold tracking-[-0.03em] leading-[1.08] max-w-[18ch]">
          Islamic calculations, with the reasoning shown.
        </h1>
        <p className="mt-5 text-[17px] sm:text-[19px] text-text-2 max-w-[60ch] leading-relaxed">
          Free calculators for Zakat, Zakat al-Fiṭr, inheritance, fidya and kaffārah. Pick your school of
          jurisprudence and every setting follows it. Where the scholars differ, each position is explained so
          you can see why the numbers come out the way they do.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/zakat" className="btn btn-primary">
            Calculate Zakat
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:rotate-180">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link href={SCHOOL_FINDER.href} className="btn btn-ghost">
            Not sure which school you follow?
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2 list-none p-0" aria-label="Schools of jurisprudence supported">
          {SCHOOLS.map((s) => (
            <li key={s.name} className="chip !font-sans !text-[13px] !py-1 !px-3">
              {s.name} <Ar className="!font-normal text-text-3 text-[14px] leading-none">{s.ar}</Ar>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tools-h" className="container pb-6">
        <h2 id="tools-h" className="eyebrow mb-4">
          Calculators
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0">
          {TOOLS.map((t, i) => (
            <li key={t.href} className={i === 0 ? "md:col-span-2" : ""}>
              <Link href={t.href} className={`card card-link hue-${t.hue} hue-stripe h-full p-5 sm:p-6 group`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[21px] sm:text-[23px] font-bold tracking-[-0.02em] text-text">{t.title}</span>
                    <Ar className="text-[20px] text-text-2">{t.titleAr}</Ar>
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-text-3 group-hover:text-text transition-colors shrink-0 rtl:rotate-180">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="block mt-2 text-[15.5px] text-text-2 leading-relaxed max-w-[70ch]">{t.summary}</span>
                <span className="block mt-3 text-[13.5px] font-medium" style={{ color: "var(--hue-text)" }}>
                  {t.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-h" className="container py-12">
        <h2 id="how-h" className="text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] mb-6">
          How these calculators work
        </h2>
        <ol className="grid gap-4 md:grid-cols-3 list-none p-0 m-0">
          {[
            {
              n: "1",
              t: "Choose your school",
              d: "Select Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī. The calculator applies that school's positions to every question. You can override any single choice.",
            },
            {
              n: "2",
              t: "Enter your figures",
              d: "Work through short steps. Each question has a plain explanation and, where it matters, a summary of what each school holds and why.",
            },
            {
              n: "3",
              t: "Read the breakdown",
              d: "See the result line by line, not only a total, so you can check it or take it to a scholar. Nothing you enter leaves your device.",
            },
          ].map((s) => (
            <li key={s.n} className="card p-5">
              <span className="mono text-[13px] font-semibold text-text-3">0{s.n}</span>
              <p className="mt-2 font-semibold text-[17px] text-text">{s.t}</p>
              <p className="mt-1.5 text-[15px] text-text-2 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="learn-h" className="container pb-4">
        <div className="card p-5 sm:p-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-center" style={{ background: "linear-gradient(135deg,var(--accent-weak),var(--surface) 55%)" }}>
          <div>
            <h2 id="learn-h" className="text-[20px] font-bold tracking-[-0.015em]">
              New to these terms?
            </h2>
            <p className="mt-1.5 text-[15.5px] text-text-2 leading-relaxed max-w-[62ch]">
              The glossary explains niṣāb, ḥawl, farāʾiḍ, ʿawl, radd, ṣāʿ, mudd and the other words used across
              the site. The methodology page explains where prices come from and how each result is worked out.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/glossary" className="btn btn-ghost">
              Glossary
            </Link>
            <Link href="/about" className="btn btn-ghost">
              Methodology
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

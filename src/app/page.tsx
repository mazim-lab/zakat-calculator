import Link from "next/link";
import { TOOLS, SITE, SCHOOL_FINDER } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { Ar, JsonLd, ScholarNote } from "@/components/ui";
import { Cartouche, Niche, Ornament, Rosette, StarMark } from "@/components/ornament";

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

const DOORS = [
  ...TOOLS.map((t) => ({ href: t.href, title: t.title, ar: t.titleAr, hue: t.hue, summary: t.summary, detail: t.detail })),
  {
    href: SCHOOL_FINDER.href,
    title: "Find your school",
    ar: "مَذْهَب",
    hue: "neutral" as const,
    summary: "Not sure which school of jurisprudence you follow? A few short questions suggest the likely one.",
    detail: "Then every calculator can follow it.",
  },
];

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="rtl:rotate-180 shrink-0">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

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

      {/* Welcome */}
      <section className="lattice border-b-[3px] border-double border-border">
        <div className="container pt-12 pb-14 sm:pt-20 sm:pb-20 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="mb-6 text-[26px] sm:text-[30px] text-text-2">
              <Ar>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Ar>
            </p>
            <h1 className="text-[40px] sm:text-[60px] font-bold leading-[1.05] max-w-[16ch]">
              Islamic calculations, with the reasoning shown.
            </h1>
            <p className="mt-6 text-[19px] sm:text-[22px] text-text-2 max-w-[56ch] leading-relaxed bg-bg/80 rounded-[var(--radius)]">
              Free calculators for Zakat, Zakat al-Fiṭr, inheritance, fidya and kaffārah. Pick your school of
              jurisprudence and every setting follows it. Where the scholars differ, each position is explained so you
              can see why the numbers come out the way they do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/zakat" className="btn btn-primary">
                Calculate Zakat
                <Arrow />
              </Link>
              <Link href={SCHOOL_FINDER.href} className="btn btn-ghost bg-bg">
                Not sure which school you follow?
              </Link>
            </div>
          </div>

          <div className="hue-indigo max-w-[420px] w-full mx-auto lg:me-0">
            <Niche tall>
              <div className="grid justify-items-center -mt-[22%]">
                <StarMark size={88} />
                <p lang="ar" dir="rtl" className="ar mt-4 text-[44px] leading-[1.5] text-indigo-text">
                  حِسَاب
                </p>
                <p className="mt-1 text-[19px] text-text">
                  <em>ḥisāb</em>: reckoning; a careful account of what is owed.
                </p>
                <p className="mt-3 text-[16px] text-text-2 ui leading-relaxed max-w-[30ch]">
                  The star is a khatam of eight equal parts. One part is set apart, as a share is set apart from an
                  estate.
                </p>
              </div>
            </Niche>
          </div>
        </div>
      </section>

      {/* The six tools */}
      <section aria-labelledby="tools-h" className="container pt-16 sm:pt-20">
        <p className="eyebrow mb-2">Six tools</p>
        <h2 id="tools-h" className="text-[30px] sm:text-[38px] font-bold">
          What would you like to work out?
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
          {DOORS.map((t) => (
            <li key={t.href} className={`hue-${t.hue}`}>
              <Link href={t.href} className="card card-link h-full p-5 flex flex-col group">
                <Cartouche>
                  <span lang="ar" dir="rtl" className="ar text-[30px] leading-[1.6]" style={{ color: "var(--hue-text)" }}>
                    {t.ar}
                  </span>
                </Cartouche>
                <span className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-[24px] font-bold text-text">{t.title}</span>
                  <span className="text-text-3 group-hover:text-[var(--hue-text)] transition-colors">
                    <Arrow />
                  </span>
                </span>
                <span className="block mt-2 text-[16.5px] text-text-2 leading-relaxed">{t.summary}</span>
                <span className="block mt-auto pt-4 text-[15.5px] ui font-medium" style={{ color: "var(--hue-text)" }}>
                  {t.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Schools of law */}
      <section aria-labelledby="schools-h" className="container pt-20">
        <Ornament className="mb-12" />
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="eyebrow mb-2">The schools of law</p>
            <h2 id="schools-h" className="text-[30px] sm:text-[38px] font-bold">
              Five schools, side by side
            </h2>
            <p className="mt-5 text-[19px] text-text-2 leading-relaxed max-w-[52ch]">
              Select Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī. The calculator applies that school&apos;s positions to
              every question. You can override any single choice.
            </p>
            <p className="mt-4 text-[19px] text-text-2 leading-relaxed max-w-[52ch]">
              Where the scholars differ, each position is explained in a &ldquo;What do the scholars say?&rdquo; panel,
              so you can see the reasoning and take it to your own scholar.
            </p>
            <Link href={SCHOOL_FINDER.href} className="btn btn-ghost mt-7">
              Find your school
              <Arrow />
            </Link>
          </div>
          <ul className="card jadwal list-none m-0 p-4 sm:p-6 grid gap-1" aria-label="Schools of jurisprudence supported">
            {SCHOOLS.map((s, i) => (
              <li key={s.name} className="flex items-center gap-4 px-3 py-3 border-b border-border last:border-b-0">
                <Rosette n={i + 1} state="done" size={34} />
                <span className="text-[22px] font-bold text-text flex-1">{s.name}</span>
                <Ar className="text-[26px] text-indigo-text">{s.ar}</Ar>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-h" className="container pt-20">
        <Ornament className="mb-12" />
        <p className="eyebrow mb-2">Three steps</p>
        <h2 id="how-h" className="text-[30px] sm:text-[38px] font-bold">
          How these calculators work
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3 list-none p-0 m-0">
          {[
            {
              n: 1,
              t: "Choose your school",
              d: "Select Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī. The calculator applies that school's positions to every question. You can override any single choice.",
            },
            {
              n: 2,
              t: "Enter your figures",
              d: "Work through short steps. Each question has a plain explanation and, where it matters, a summary of what each school holds and why.",
            },
            {
              n: 3,
              t: "Read the breakdown",
              d: "See the result line by line, not only a total, so you can check it or take it to a scholar. Nothing you enter leaves your device.",
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-4">
              <Rosette n={s.n} state="current" size={44} />
              <div>
                <p className="font-bold text-[21px] text-text">{s.t}</p>
                <p className="mt-2 text-[17.5px] text-text-2 leading-relaxed">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Stance and reference */}
      <section aria-labelledby="stance-h" className="container pt-20">
        <Ornament className="mb-12" />
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 id="stance-h" className="sr-only">
              A tool, not a fatwa
            </h2>
            <ScholarNote />
            <p className="mt-4 text-[17px] text-text-2 leading-relaxed">
              The{" "}
              <Link href="/about" className="lnk">
                methodology page
              </Link>{" "}
              explains where prices come from and how each result is worked out.
            </p>
          </div>
          <div className="card p-6 sm:p-7">
            <p className="eyebrow mb-2">Reference</p>
            <h2 className="text-[24px] font-bold">New to these terms?</h2>
            <p className="mt-3 text-[17.5px] text-text-2 leading-relaxed">
              The glossary explains niṣāb, ḥawl, farāʾiḍ, ʿawl, radd, ṣāʿ, mudd and the other words used across the
              site. The methodology page explains where prices come from and how each result is worked out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/glossary" className="btn btn-ghost">
                Glossary
              </Link>
              <Link href="/about" className="btn btn-ghost">
                Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { GLOSSARY, glossaryLetter, type GlossaryEntry } from "@/lib/glossary";
import { PageIntro, JsonLd, Ar, Callout } from "@/components/ui";

const PATH = "/glossary";
const TITLE = "Glossary of Islamic Finance Terms";
const DESCRIPTION =
  "Plain-English meanings of the Arabic terms used in the Zakat, Zakat al-Fiṭr, inheritance, fidya and kaffārah calculators: niṣāb, ḥawl, ṣāʿ, mudd, Khums, farāʾiḍ, ʿawl, radd, ḥajb and more.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function groupByLetter(entries: GlossaryEntry[]) {
  const groups = new Map<string, GlossaryEntry[]>();
  for (const e of entries) {
    const l = glossaryLetter(e);
    if (!groups.has(l)) groups.set(l, []);
    groups.get(l)!.push(e);
  }
  return groups;
}

export default function GlossaryPage() {
  const groups = groupByLetter(GLOSSARY);

  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": absoluteUrl(PATH) + "#terms",
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url + "/" },
    hasDefinedTerm: GLOSSARY.map((e) => ({
      "@type": "DefinedTerm",
      "@id": absoluteUrl(PATH) + "#" + e.id,
      name: e.term,
      alternateName: [e.ar, ...(e.also ? e.also.split(/[;,]\s*/).filter(Boolean) : [])],
      description: e.definition,
      url: absoluteUrl(PATH) + "#" + e.id,
      inDefinedTermSet: absoluteUrl(PATH) + "#terms",
    })),
  };

  return (
    <div className="container-narrow">
      <JsonLd
        data={[
          definedTermSet,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Glossary", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        breadcrumb="Glossary"
        eyebrow="Reference"
        title="Glossary of Islamic finance terms"
        titleAr="مسرد المصطلحات"
        lead="The Arabic words used across the calculators, in plain English. Each entry links to the calculator where the term comes up. Where the schools understand a term differently, the entry says so."
      />

      <nav aria-label="Jump to letter" className="card jadwal p-4 sm:p-5">
        <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
          {ALPHABET.map((l) =>
            groups.has(l) ? (
              <li key={l}>
                <a
                  href={`#letter-${l}`}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full text-[19px] font-bold text-indigo-text hover:bg-indigo-bg"
                >
                  {l}
                </a>
              </li>
            ) : (
              <li key={l} aria-hidden="true">
                <span className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[19px] text-text-3">
                  {l}
                </span>
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="mt-6">
        {ALPHABET.filter((l) => groups.has(l)).map((l) => (
          <section key={l} id={`letter-${l}`} aria-labelledby={`letter-${l}-h`} className="py-8 border-t-[3px] border-double border-border first:border-t-0">
            <h2 id={`letter-${l}-h`} className="text-[34px] font-bold mb-4" style={{ color: "var(--rubric)" }}>
              {l}
            </h2>
            <dl className="m-0 grid gap-7">
              {groups.get(l)!.map((e) => (
                <div key={e.id} id={e.id}>
                  <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <a href={`#${e.id}`} className="text-[22px] font-bold text-text hover:underline underline-offset-4">
                      {e.term}
                    </a>
                    <Ar className="text-[24px] text-indigo-text">{e.ar}</Ar>
                    {e.also && <span className="text-[16px] text-text-2 italic">also {e.also}</span>}
                  </dt>
                  <dd className="m-0 mt-1.5 text-[18px] text-text-2 leading-relaxed max-w-[68ch]">
                    {e.definition}{" "}
                    <Link href={e.href} className="lnk whitespace-nowrap">
                      {e.hrefLabel}
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <Callout tone="neutral" title="Definitions, not rulings" className="mt-8">
        These entries explain what the words mean. They are not rulings. For how a term applies to your situation,
        ask a qualified scholar of your school.
      </Callout>
    </div>
  );
}

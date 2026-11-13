import Link from "next/link";
import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { MADHAB_INFO } from "@/lib/scholarly-info";
import { PageIntro, Section, Callout, Faq, JsonLd, Ar, RelatedTools, Sources } from "@/components/ui";
import SchoolFinder from "./SchoolFinder";

const PATH = "/find-your-school";
const TITLE = "Which School of Islamic Law Do You Follow?";
const DESCRIPTION =
  "Answer up to six short questions about your background and how you pray to see which school of Islamic law (madhhab) you most likely follow: Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

// Plain restatement of MADHAB_INFO (src/lib/scholarly-info.ts). Founder,
// Arabic name and regions are read from that file so they stay in sync.
const SCHOOLS: { key: keyof typeof MADHAB_INFO; name: string; summary: string }[] = [
  {
    key: "hanafi",
    name: "Ḥanafī",
    summary:
      "The most widely followed school. It is known for analogical reasoning (qiyās) and juristic preference (istiḥsān). On Zakat it is generally the most cautious: more assets count, and the silver niṣāb means more people reach the threshold.",
  },
  {
    key: "maliki",
    name: "Mālikī",
    summary:
      "Rooted in the practice of the people of Madīnah and the principle of public interest (maṣlaḥa). It takes a moderate approach to Zakat, with weight on the practical welfare of the community.",
  },
  {
    key: "shafii",
    name: "Shāfiʿī",
    summary:
      "Known for a systematic method that joins textual evidence with analogical reasoning. On Zakat, debts generally do not reduce zakatable wealth, and worn jewelry is exempt.",
  },
  {
    key: "hanbali",
    name: "Ḥanbalī",
    summary:
      "Holds closely to the textual evidence of the Qurʾān and Sunnah. On debts it is similar to the Ḥanafī school. On jewelry it agrees with the majority that worn jewelry is exempt.",
  },
  {
    key: "jafari",
    name: "Jaʿfarī",
    summary:
      "The main school of Twelver Shia Islam. Obligatory Zakat applies only to nine specific items (wheat, barley, dates, raisins, gold coins, silver coins, sheep, cattle and camels). Cash and modern financial assets are covered instead by Khums: 20% of surplus annual income.",
  },
];

const FAQ = [
  {
    q: "Is this quiz a ruling on which school I must follow?",
    a: "No. It is a best guess based on common patterns of region and prayer. The most reliable way to know your school is to ask your family, or the imam or teacher you learned from.",
  },
  {
    q: "Why does the quiz ask where my family is from?",
    a: "Schools of law are strongly tied to geography, so region is often the best single indicator. It is still only an indicator: families move, and people follow teachers from other schools.",
  },
  {
    q: "What if I am a convert, or my result says \"Varies\"?",
    a: "Ask the teacher or community you learned from which school they follow. If your family is from a specific country, that country's predominant school is a reasonable starting point.",
  },
  {
    q: "Are my answers saved or sent anywhere?",
    a: "No. The quiz runs in your browser. Your answers are not stored and are not sent to any server.",
  },
];

export default function FindYourSchoolPage() {
  return (
    <div className="container-narrow">
      <JsonLd
        data={[
          calculatorJsonLd({ path: PATH, name: "School of Islamic law finder", description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Find your school", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        hue="neutral"
        breadcrumb="Find your school"
        eyebrow="School finder"
        title="Which school of Islamic law do you follow?"
        titleAr="ما مذهبي؟"
        lead={
          <>
            Not sure which <em>madhhab</em> (school of Islamic law) you follow? Answer up to six short questions and
            we&apos;ll suggest the school you most likely follow. Each calculator on this site can then apply that
            school&apos;s positions.
          </>
        }
      />

      <SchoolFinder />

      <Callout tone="neutral" title="Your local scholar matters more than a quiz" className="mt-6">
        A quiz can only spot common patterns. Your family tradition, the teacher you learned from and a qualified
        scholar you trust are better guides. If a scholar you follow holds a different position from the one a
        calculator shows, follow your scholar. You can change any setting in the calculators to match.
      </Callout>

      <Section id="five-schools" title="The five schools at a glance" className="mt-10">
        <p className="text-text-2 leading-relaxed mb-6 max-w-[65ch]">
          The calculators on this site support four Sunni schools and one Shia school. Each is a long-standing
          tradition of Islamic law, named after the scholar whose teaching it follows. Where they differ on a
          question, the calculators explain each position side by side.
        </p>
        <ul className="grid gap-3 list-none p-0 m-0">
          {SCHOOLS.map((s) => {
            const info = MADHAB_INFO[s.key];
            return (
              <li key={s.key} className="card p-5">
                <h3 className="flex flex-wrap items-baseline gap-x-3 text-[19px] font-semibold">
                  <span>{s.name}</span>
                  <Ar className="text-[20px] font-normal text-text-2">{info.nameAr}</Ar>
                </h3>
                <p className="mt-2 text-[15.5px] text-text-2 leading-relaxed">{s.summary}</p>
                <dl className="mt-3 grid gap-1 text-[14px] sm:grid-cols-[auto_1fr] sm:gap-x-4">
                  <dt className="font-semibold text-text">Named after</dt>
                  <dd className="m-0 text-text-2">{info.founder}</dd>
                  <dt className="font-semibold text-text">Main regions</dt>
                  <dd className="m-0 text-text-2">{info.regions}</dd>
                </dl>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-[15px] text-text-2 leading-relaxed">
          New to these words? The <Link href="/glossary#madhhab" className="lnk">glossary</Link> explains madhhab,
          niṣāb, Khums and the other terms used on this site.
        </p>
        <Sources>
          <p>
            School summaries restate the site&apos;s own school notes, used in the{" "}
            <Link href="/zakat" className="lnk">Zakat calculator</Link>. Founder dates are as given there.
          </p>
        </Sources>
      </Section>

      <Section id="faq" title="Questions">
        <Faq items={FAQ} />
      </Section>

      <Section id="calculators" title="Calculators">
        <RelatedTools />
      </Section>
    </div>
  );
}

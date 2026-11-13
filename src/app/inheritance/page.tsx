import Link from "next/link";
import type { ReactNode } from "react";
import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd, howToJsonLd } from "@/lib/seo";
import { JsonLd, PageIntro, ScholarNote, Section, Faq, Toc, RelatedTools, Sources, Callout } from "@/components/ui";
import { calculateInheritance } from "@/lib/inheritance/calculate";
import { computeNetEstate } from "@/lib/inheritance/deductions";
import { numberToFraction, formatUSD, formatPercent } from "@/lib/inheritance/fraction";
import InheritanceCalculator from "./InheritanceCalculator";
import { SharesDonut } from "./SharesDonut";
import { EXAMPLE_FAMILY, EXAMPLE_AWL, type WorkedExample } from "./examples";

const PATH = "/inheritance";
const TITLE = "Islamic Inheritance Calculator (Mīrāth)";
const DESCRIPTION =
  "Divide an estate by the Qurʾānic shares (farāʾiḍ) for the Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī school, with ʿawl, radd and ḥajb explained.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const Q = (verse: string) => `https://quran.com/${verse.replace(":", "/")}`;
function Ayah({ v }: { v: string }) {
  return (
    <a href={Q(v)} className="lnk" target="_blank" rel="noopener noreferrer">
      Qurʾān {v}
    </a>
  );
}

const FIXED_SHARES: { share: string; who: ReactNode; ref: string[] }[] = [
  {
    share: "1/2",
    who: "The husband, when the deceased left no children. One daughter, when there is no son. One full sister (or, if there is none, one paternal half-sister), when there are no children, no father or grandfather and no brother of the same kind.",
    ref: ["4:11", "4:12", "4:176"],
  },
  { share: "1/4", who: "The husband, when there are children. The wife, when there are no children.", ref: ["4:12"] },
  { share: "1/8", who: "The wife, when there are children. Two or more wives share this one eighth.", ref: ["4:12"] },
  {
    share: "2/3",
    who: "Two or more daughters, when there is no son. Two or more full sisters (or paternal half-sisters), when there are no children, no father or grandfather and no brother of the same kind.",
    ref: ["4:11", "4:176"],
  },
  {
    share: "1/3",
    who: "The mother, when there are no children and fewer than two siblings. Two or more maternal half-siblings share one third equally, when there is no child, no son's child, no father and no paternal grandfather.",
    ref: ["4:11", "4:12"],
  },
  {
    share: "1/6",
    who: "Each parent, when there are children. The mother, when there are two or more siblings. One maternal half-sibling. A son's daughter beside one daughter, and a paternal half-sister beside one full sister, to complete two thirds. This calculator also gives 1/6 to a grandfather or grandmother standing in for an absent parent, as the schools do.",
    ref: ["4:11", "4:12"],
  },
];

const FAQ = [
  {
    q: "Who inherits under Islamic law?",
    a: "The Qurʾān names fixed shares for the spouse, children, parents and siblings (4:11, 4:12, 4:176). Closer relatives can reduce or exclude more distant ones (ḥajb). In the Sunni schools, any amount left after the fixed shares goes to the residuary heirs (ʿaṣabah): a son, then a son's son, the father, the grandfather, a full brother, then a paternal half-brother, with sisters of the same kind at half a brother's share. A sister also takes the residue alongside a daughter. The Jaʿfarī school uses classes of heirs instead.",
  },
  {
    q: "What is paid before the estate is divided?",
    a: "Funeral and burial costs, then debts, then any bequest (waṣiyyah). Only what is left is divided among the heirs. The Qurʾān says the shares apply after any bequest or debt (4:11, 4:12). Scholars generally limit a bequest to one third unless the heirs agree to more.",
  },
  {
    q: "What happens if there are no heirs, or only a spouse?",
    a: "With no heirs, the whole estate goes to Bayt al-Māl, the public treasury. With only a spouse, this calculator follows the classical Sunni position: the spouse takes their fixed share and the rest goes to Bayt al-Māl. Where no Bayt al-Māl exists, many scholars direct that portion to Islamic charitable causes, and some return it to the spouse. A will can settle this in advance.",
  },
  {
    q: "What are ʿawl and radd?",
    a: "ʿAwl applies when the fixed shares add up to more than the whole estate: every share is reduced in proportion so the total is exactly one. Radd is the opposite: when the shares add up to less than one and there is no residuary heir, the surplus is returned to the fixed-share heirs in proportion. In the Sunni schools as applied here, the spouse does not take part in radd; this follows the Ḥanafī and Ḥanbalī schools and the later Shāfiʿī ruling, while the classical Mālikī and Shāfiʿī position sends the surplus to the public treasury. The Jaʿfarī school does not apply ʿawl.",
  },
  {
    q: "Do the schools give different answers?",
    a: "For most families, the four Sunni schools agree. They differ on some cases, such as a grandfather inheriting with brothers and sisters: the Ḥanafī school lets him exclude them, while the Mālikī, Shāfiʿī and Ḥanbalī schools have him share with them by Zayd ibn Thābit's method, which the calculator follows for those schools. The Jaʿfarī school has a different structure: closer classes of heirs exclude more distant classes, there is no ʿaṣabah, and there is no ʿawl. Choose your school in step 3 and read the notes beside each choice.",
  },
  {
    q: "Which relatives does this calculator cover?",
    a: "Husband, wife or wives, sons, daughters, son's sons and son's daughters, father, mother, paternal grandfather, paternal and maternal grandmothers, full brothers and sisters, and paternal and maternal half-brothers and half-sisters. It does not ask about a daughter's children, nephews, uncles, cousins, a maternal grandfather or other relatives. If any of them survive the deceased, ask a scholar to check the division.",
  },
  {
    q: "Can I use this result to distribute a real estate?",
    a: "Use it to understand the shares and to prepare questions. A real estate also depends on the law of the country where the person lived or held property, on any will, and on facts this tool does not ask about. Please confirm the division with a qualified scholar and a local lawyer before anything is paid out.",
  },
];

function ExampleResult({ ex }: { ex: WorkedExample }) {
  const estate = computeNetEstate(ex.estate);
  const result = calculateInheritance(estate.net, { ...ex.heirs }, ex.madhab);
  const pie = result.shares
    .filter((s) => (s.share ?? 0) > 0)
    .map((s) => ({
      name: `${s.label}${s.count > 1 ? ` (×${s.count})` : ""}`,
      value: s.amount,
      share: s.share ?? 0,
      fraction: numberToFraction(s.share ?? 0),
    }));
  const hasDeductions = ex.estate.funeral + ex.estate.debts + ex.estate.bequest > 0;
  return (
    <div className="card p-4 sm:p-5 mt-4">
      <p className="eyebrow mb-1">Example inputs</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] m-0">
        <dt className="text-text-2">Heirs</dt>
        <dd className="m-0 text-text">{ex.heirsLabel}</dd>
        <dt className="text-text-2">School</dt>
        <dd className="m-0 text-text">{ex.madhabLabel}</dd>
        {hasDeductions ? (
          <>
            <dt className="text-text-2">Estate</dt>
            <dd className="m-0 num text-text">{formatUSD(ex.estate.gross)}</dd>
            <dt className="text-text-2">Funeral costs</dt>
            <dd className="m-0 num text-text">− {formatUSD(ex.estate.funeral)}</dd>
            <dt className="text-text-2">Debts</dt>
            <dd className="m-0 num text-text">− {formatUSD(ex.estate.debts)}</dd>
            <dt className="text-text-2">Bequest</dt>
            <dd className="m-0 num text-text">
              − {formatUSD(ex.estate.bequest)}{" "}
              <span className="text-text-2 font-sans text-[13.5px]">
                (below one third of {formatUSD(estate.afterDebts)}, which is {formatUSD(estate.oneThirdAfterDebts)})
              </span>
            </dd>
          </>
        ) : null}
        <dt className="text-text-2 font-semibold">Net estate</dt>
        <dd className="m-0 num text-text font-semibold">{formatUSD(estate.net)}</dd>
      </dl>
      <div className="mt-5">
        <SharesDonut data={pie} title={`Example: ${ex.heirsLabel}`} />
      </div>
      <div className="table-wrap mt-5" tabIndex={0} role="region" aria-label="Scrollable table">
        <table className="table">
          <caption className="sr-only">Computed shares for the example: {ex.heirsLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Heir</th>
              <th scope="col" className="num">Share</th>
              <th scope="col" className="num">%</th>
              <th scope="col" className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {result.shares.map((s) => (
              <tr key={s.heir}>
                <td className="text-text">
                  {s.label} {s.count > 1 ? `(x${s.count})` : ""}
                </td>
                <td className="num">{numberToFraction(s.share ?? 0)}</td>
                <td className="num">{formatPercent(s.share ?? 0)}</td>
                <td className="num">{formatUSD(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.wasAwlApplied && <p className="field-hint">Calculator note: {result.awlExplanation}</p>}
      <p className="field-hint">Figures are an example only. They were computed by this page&apos;s own calculator code.</p>
    </div>
  );
}

const TOC = [
  { id: "calculator", label: "Calculator" },
  { id: "what-it-is", label: "What Islamic inheritance is" },
  { id: "fixed-shares", label: "The fixed shares" },
  { id: "awl-radd-hajb", label: "ʿAwl, radd and ḥajb" },
  { id: "worked-example", label: "Worked examples" },
  { id: "law-and-wills", label: "Local law and wills" },
  { id: "faq", label: "Questions" },
  { id: "related", label: "Related tools" },
];

export default function InheritancePage() {
  return (
    <div className="container">
      <JsonLd
        data={[
          calculatorJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Inheritance", path: PATH },
          ]),
          howToJsonLd({
            name: "How to divide an estate with the Islamic inheritance calculator",
            description: "Select the heirs, enter the estate and deductions, choose a school, then read the shares.",
            steps: [
              { name: "Select heirs", text: "Choose every living relative of the deceased and how many there are of each." },
              { name: "Set the estate value", text: "Enter the estate, then funeral costs, debts and any bequest." },
              { name: "Choose a school", text: "Pick the Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī school." },
              { name: "Read the results", text: "See each heir's fraction and amount, with any ʿawl, radd or exclusion explained." },
            ],
          }),
        ]}
      />

      <PageIntro
        hue="fuchsia"
        breadcrumb="Inheritance"
        eyebrow="Calculator"
        title="Islamic inheritance calculator"
        titleAr="حساب الميراث"
        lead="Calculate the distribution of an estate according to Islamic law (farāʾiḍ, mīrāth). Choose the heirs, enter the estate, pick your school, and see each share as a fraction and an amount."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
        <div className="min-w-0">
          <section id="calculator" aria-label="Inheritance calculator" className="pb-8">
            <InheritanceCalculator />
            <ScholarNote className="mt-5" />
          </section>

          <Section id="what-it-is" title="What Islamic inheritance is">
            <div className="prose">
              <p>
                Islamic inheritance (<em>mīrāth</em>, also called <em>farāʾiḍ</em>, &ldquo;the fixed shares&rdquo;) is the
                set of rules for dividing what a Muslim leaves at death. The Qurʾān names the main heirs and their shares in
                Sūrat al-Nisāʾ: <Ayah v="4:11" />, <Ayah v="4:12" /> and <Ayah v="4:176" />.
              </p>
              <p>Before anything is shared out, the estate is reduced in this order:</p>
              <ol>
                <li>
                  <strong>Funeral and burial costs.</strong>
                </li>
                <li>
                  <strong>Debts</strong>, including loans and unpaid bills.
                </li>
                <li>
                  <strong>A bequest (waṣiyyah)</strong>, if the deceased left one. Scholars generally limit it to one third
                  of what remains, unless the heirs agree to more. The limit comes from the hadith of Saʿd ibn Abī Waqqāṣ,
                  who asked to bequeath his wealth and was told: &ldquo;Yes, one third, yet even one third is too much&rdquo;
                  (
                  <a className="lnk" href="https://sunnah.com/bukhari:2742" target="_blank" rel="noopener noreferrer">
                    Ṣaḥīḥ al-Bukhārī 2742
                  </a>
                  ).
                </li>
                <li>
                  <strong>The heirs&apos; shares</strong> are then worked out on what is left.
                </li>
              </ol>
              <p>
                The Qurʾān states that the shares apply &ldquo;after any bequest or debt&rdquo; (<Ayah v="4:11" />,{" "}
                <Ayah v="4:12" />). Step 2 of the calculator follows this order. It subtracts funeral costs, debts and the
                bequest from the estate and divides the rest. If the bequest is above one third, it warns you but uses your
                figure.
              </p>
              <p>
                In the four Sunni schools, heirs with a fixed share are paid first. Anything left goes to the residuary heirs
                (<em>ʿaṣabah</em>), for example a son, or the father when there are no sons, or a brother when there is no son or father
                (a sister takes half a brother's share, and takes the residue herself beside a daughter). The Jaʿfarī school has no
                ʿaṣabah: it groups heirs into classes, and a closer class excludes the more distant ones.
              </p>
            </div>
          </Section>

          <Section id="fixed-shares" title="The six fixed shares">
            <p className="text-text-2 mb-4 max-w-[65ch]">
              The Qurʾān names six fractions. Who receives each one depends on who else survives the deceased.
            </p>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
              <table className="table">
                <caption className="sr-only">The six fixed shares, who can receive each, and the Qurʾān references</caption>
                <thead>
                  <tr>
                    <th scope="col">Share</th>
                    <th scope="col">Who can receive it</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {FIXED_SHARES.map((f) => (
                    <tr key={f.share}>
                      <td className="num font-semibold text-text text-[16px] whitespace-nowrap">{f.share}</td>
                      <td className="text-text-2 leading-relaxed">{f.who}</td>
                      <td className="whitespace-nowrap text-[14px]">
                        {f.ref.map((r) => (
                          <span key={r} className="block">
                            <a href={Q(r)} className="lnk" target="_blank" rel="noopener noreferrer">
                              {r}
                            </a>
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="field-hint mt-3">
              Where children and siblings inherit together, a male receives the share of two females (
              <Ayah v="4:11" />, <Ayah v="4:176" />
              ). Treating a son&apos;s daughter like a daughter, and a grandparent like an absent parent, comes from the
              schools&apos; reading of these verses.
            </p>
          </Section>

          <Section id="awl-radd-hajb" title="ʿAwl, radd and ḥajb in plain words">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="card p-4">
                <p className="font-semibold text-text">ʿAwl: shares too large</p>
                <p className="text-[15px] text-text-2 mt-1 leading-relaxed">
                  Sometimes the fixed shares add up to more than the whole estate. Each share is then reduced in proportion,
                  so everyone loses the same fraction of their share. The four Sunni schools apply ʿawl. The Jaʿfarī school
                  does not.
                </p>
              </div>
              <div className="card p-4">
                <p className="font-semibold text-text">Radd: shares too small</p>
                <p className="text-[15px] text-text-2 mt-1 leading-relaxed">
                  Sometimes the fixed shares add up to less than the estate and no residuary heir is left. The surplus is
                  returned to the fixed-share heirs in proportion. As applied here for the Sunni schools, the spouse does not
                  share in radd. Scholars differ on this, as the notes in step 3 explain.
                </p>
              </div>
              <div className="card p-4">
                <p className="font-semibold text-text">Ḥajb: exclusion</p>
                <p className="text-[15px] text-text-2 mt-1 leading-relaxed">
                  A closer heir can shut out a more distant one, for example a father excludes the grandfather. A closer heir
                  can also reduce another&apos;s share, for example children reduce a husband from 1/2 to 1/4 (
                  <Ayah v="4:12" />
                  ).
                </p>
              </div>
            </div>
          </Section>

          <Section id="worked-example" title="Worked examples">
            <h3 className="text-[18.5px] font-[650]">1. {EXAMPLE_FAMILY.title}</h3>
            <div className="prose mt-2">
              <p>
                The wife takes 1/8 because there are children. Each parent takes 1/6 because there are children. That is
                3/24 + 4/24 + 4/24 = 11/24. The son and daughter share the remaining 13/24 as residuary heirs, the son taking
                twice the daughter&apos;s share: 26/72 and 13/72, which simplify to 13/36 and 13/72. The four Sunni schools
                agree on this family.
              </p>
            </div>
            <ExampleResult ex={EXAMPLE_FAMILY} />

            <h3 className="text-[18.5px] font-[650] mt-10">2. {EXAMPLE_AWL.title}</h3>
            <div className="prose mt-2">
              <p>
                The husband takes 1/2 (no children). The mother takes 1/6 (two siblings are present). The two sisters take
                2/3. In sixths that is 3 + 1 + 4 = 8 parts out of 6, more than the estate. With ʿawl the estate is divided
                into 8 parts instead: husband 3/8, mother 1/8, sisters 4/8 (1/2) between them. The Jaʿfarī school does not
                apply ʿawl and divides this family differently.
              </p>
            </div>
            <ExampleResult ex={EXAMPLE_AWL} />
          </Section>

          <Section id="law-and-wills" title="Local law, wills and advice">
            <Callout tone="warning" title="The calculator does not replace a will or a lawyer">
              <p>
                In many countries, an estate is divided by the local law of intestacy unless there is a valid will. That law
                usually does not follow the Qurʾānic shares. A properly made will (waṣiyyah) that sets out the Islamic
                division, and names any bequest and the handling of any Bayt al-Māl portion, is the practical way to make
                sure your wishes are followed. Ask a qualified scholar to check the shares, and a local lawyer to draft and
                witness the will.
              </p>
            </Callout>
          </Section>

          <Section id="faq" title="Questions people ask">
            <Faq items={FAQ} />
          </Section>

          <Section id="related" title="Related tools">
            <RelatedTools current={PATH} />
            <p className="mt-4 text-[15px] text-text-2">
              Not sure which school you follow?{" "}
              <Link href="/find-your-school" className="lnk">
                Find your school
              </Link>
              . New to the terms? See the{" "}
              <Link href="/glossary" className="lnk">
                glossary
              </Link>
              .
            </p>
            <Sources>
              <ul className="m-0 ps-5 space-y-1">
                <li>
                  Qurʾān, Sūrat al-Nisāʾ <a className="lnk" href={Q("4:11")} target="_blank" rel="noopener noreferrer">4:11</a>{" "}
                  (children and parents), <a className="lnk" href={Q("4:12")} target="_blank" rel="noopener noreferrer">4:12</a>{" "}
                  (spouses and maternal siblings) and{" "}
                  <a className="lnk" href={Q("4:176")} target="_blank" rel="noopener noreferrer">4:176</a> (sisters and
                  brothers), on quran.com.
                </li>
                <li>
                  On the one-third limit for bequests: Ṣaḥīḥ al-Bukhārī 2742 (Saʿd ibn Abī Waqqāṣ), on{" "}
                  <a className="lnk" href="https://sunnah.com/bukhari:2742" target="_blank" rel="noopener noreferrer">sunnah.com</a>.
                </li>
                <li>
                  The scholarly notes in the calculator (ʿawl, radd, ḥajb, grandfather and siblings, ʿUmariyyatān, the
                  Jaʿfarī system and Bayt al-Māl) set out each school&apos;s position and its reasoning.
                </li>
                <li>
                  On a Bayt al-Māl portion where no public treasury exists: the Fiqh Council of North America and the
                  European Council for Fatwa and Research, as summarised in the calculator&apos;s Bayt al-Māl note.
                </li>
              </ul>
            </Sources>
          </Section>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-24 pt-2">
          <Toc items={TOC} />
        </aside>
      </div>
    </div>
  );
}

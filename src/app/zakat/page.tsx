import Link from "next/link";
import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd, howToJsonLd, type FaqItem } from "@/lib/seo";
import { PageIntro, ScholarNote, Section, Faq, RelatedTools, Sources, JsonLd, Toc, Ar } from "@/components/ui";
import { calculateZakat } from "@/lib/calculate";
import { formatCurrency } from "@/lib/currency";
import { MADHAB_INFO } from "@/lib/scholarly-info";
import {
  EXAMPLE_ASSETS,
  EXAMPLE_CURRENCY,
  EXAMPLE_GOLD_PER_GRAM,
  EXAMPLE_INPUT_ROWS,
  EXAMPLE_SCHOOLS,
  EXAMPLE_SILVER_PER_GRAM,
  exampleChoices,
} from "@/lib/zakat/example";
import { GOLD_NISAB_GRAMS_DISPLAY, SILVER_NISAB_GRAMS_DISPLAY } from "@/lib/zakat/page-math";
import { tidyDash } from "@/lib/zakat/display";
import { ZakatCalculator } from "./ZakatCalculator";

const PATH = "/zakat";
const TITLE = "Zakat Calculator";
const DESCRIPTION =
  "Calculate Zakat on cash, gold, jewelry, stocks, 401(k) and RRSP, crypto, crops and livestock, with live gold and silver prices and each school's view.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

/* ---------- worked example, computed at build time with the real calculator ---------- */
const usd = (n: number) => formatCurrency(n, EXAMPLE_CURRENCY);
const example = calculateZakat(exampleChoices("hanafi"), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM);
const exampleBySchool = EXAMPLE_SCHOOLS.map((m) => ({
  m,
  r: calculateZakat(exampleChoices(m), EXAMPLE_ASSETS, EXAMPLE_GOLD_PER_GRAM, EXAMPLE_SILVER_PER_GRAM),
}));

/* ---------- how the calculator works (mirrors src/lib/calculate.ts) ---------- */
const HOW_STEPS: { name: string; text: string }[] = [
  {
    name: "Choose your school and settings",
    text: "Pick Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī to load that school's preset, or choose Custom. You can change any single setting, such as the niṣāb standard, worn jewelry, stock method, retirement accounts, debts, crypto and lunar or solar year.",
  },
  {
    name: "Set the niṣāb",
    text: `The calculator multiplies ${GOLD_NISAB_GRAMS_DISPLAY} g by the gold price per gram (gold standard) or ${SILVER_NISAB_GRAMS_DISPLAY} g by the silver price per gram (silver standard). Prices come from a live market feed, converted to your currency.`,
  },
  {
    name: "Enter what you own",
    text: "Cash and bank balances, gold and silver, jewelry, shares and funds, rental income, property for sale, business cash, stock and receivables, TFSA or Roth IRA, RRSP, 401(k) or traditional IRA, vested employer match, crypto, crops and livestock. Your home, car and business equipment are not entered.",
  },
  {
    name: "Enter your debts",
    text: "Short-term debts are deducted in full. For long-term loans you enter the monthly principal only, never the interest. The calculator deducts 12 months of principal, one month only, or nothing, depending on the debt method.",
  },
  {
    name: "Compare with the niṣāb and apply the rate",
    text: "If your wealth after debts is at or above the niṣāb, Zakat is 2.5% of the zakatable amount. Debts reduce the money lines in proportion. A solar year adds about 3%. Crops (10% or 5%) and livestock (fixed tables) have their own minimums and are due even when your money is below the niṣāb.",
  },
  {
    name: "Read the breakdown",
    text: "The result shows each asset line, its Zakat, the niṣāb used and the total. For the Jaʿfarī school it also shows Khums: 20% of income left after a year's expenses.",
  },
];

/* ---------- FAQ: restates the site's own scholarly-info positions ---------- */
const FAQ: FaqItem[] = [
  {
    q: "Do I pay Zakat on jewelry I wear?",
    a: "The schools differ. The Ḥanafī school holds that Zakat is due on all gold and silver jewelry, even if worn. The Mālikī, Shāfiʿī and Ḥanbalī schools hold that jewelry worn as personal adornment is exempt. In Jaʿfarī fiqh there is no obligatory Zakat on jewelry. All schools agree that jewelry kept as an investment, and not worn, is zakatable. NZF Canada recommends paying on jewelry as the more cautious position. When jewelry is zakatable, this calculator values gold jewelry at a fraction of the spot price that depends on its karat (for example 69.9% for 22 karat), based on dealer buyback rates.",
  },
  {
    q: "Is my 401(k), RRSP or pension zakatable?",
    a: "TFSA and Roth IRA balances are zakatable, with virtually no disagreement, because you can reach the money. For an RRSP, 401(k) or traditional IRA, scholars differ. The calculator offers four positions: the full balance every year (Fiqh Council of North America, 2024), the balance minus the tax you would pay on withdrawal (National Zakat Foundation Canada), no yearly Zakat but back-payment for past years on each withdrawal (Dr. Monzer Kahf), or excluding the account. Only vested employer contributions count. A defined-benefit pension such as CPP or OAS is generally not zakatable until you receive the payments. In Jaʿfarī fiqh these accounts carry no obligatory Zakat; surplus savings fall under Khums.",
  },
  {
    q: "Do my debts and mortgage reduce my Zakat?",
    a: "It depends on your school. In the Ḥanafī and Ḥanbalī approach used here, debts due within 12 months are deducted in full, and for long-term loans such as a mortgage you deduct up to 12 months of principal; a stricter view allows only the instalment currently due. The Mālikī school deducts debts from hidden wealth such as cash, gold and trade goods, but not from livestock or crops. In the Shāfiʿī school debt does not reduce zakatable wealth. In every case interest is never deducted, only principal. Example from the site's notes: with $100,000 in savings and $1,500 a month of mortgage principal, the Ḥanafī approach deducts $18,000 and leaves $82,000 subject to Zakat, while the Shāfiʿī approach counts the full $100,000.",
  },
  {
    q: "Should I use the lunar or the solar year?",
    a: "Zakat follows the Islamic lunar year of about 354 days, which is the standard position of all four Sunni schools. If you track your Zakat date on the Gregorian calendar for convenience, the calculator adds about 3% to cover the extra days. In the code this is a multiplier of 1.0307, the ratio of 365.25 to 354.36 days. Crops and livestock are not adjusted.",
  },
  {
    q: "Which niṣāb should I use, gold or silver?",
    a: `The gold standard is ${GOLD_NISAB_GRAMS_DISPLAY} grams of gold and is used by the majority of modern scholars, who see gold as a more stable measure of wealth. The silver standard is ${SILVER_NISAB_GRAMS_DISPLAY} grams of silver. It is the more cautious view, used in the Ḥanafī preset, and far more people reach it. At today's prices the two thresholds are very different, so the choice can decide whether you owe Zakat at all. The calculator shows both amounts from live prices.`,
  },
  {
    q: "How is cryptocurrency treated?",
    a: "Scholarly consensus has not fully formed. Most scholars who consider crypto permissible treat it like currency and add its market value to your wealth at 2.5%. Others treat it as trade goods, which gives the same 2.5% on market value. A minority, mostly those who consider it impermissible, exclude it. In Jaʿfarī fiqh crypto carries no obligatory Zakat, but surplus gains fall under Khums.",
  },
  {
    q: "Which school should I choose?",
    a: "Choose the school you follow. If you are not sure, the short quiz on this site can help you find it. Each preset fills in that school's position on every question, and you can still change any single setting. If you change one, the calculator labels your setup as Custom so the result is clear about what it is based on.",
  },
  {
    q: "Is my home, car or business equipment zakatable?",
    a: "Your primary residence is not subject to Zakat. Fixed assets used in a business, such as machinery, buildings and vehicles, are not zakatable either. What counts is liquid business wealth: business cash, stock for sale at wholesale value, and money owed to you that you expect to be paid. Property you hold for sale and net rental income are zakatable.",
  },
];

const TOC = [
  { id: "what-is-zakat", label: "What Zakat is" },
  { id: "how-it-works", label: "How this calculator works" },
  { id: "worked-example", label: "Worked example" },
  { id: "who-receives", label: "Who can receive Zakat" },
  { id: "faq", label: "Questions" },
  { id: "related", label: "Related tools" },
];

export default function ZakatPage() {
  return (
    <div className="container-narrow pb-16">
      <JsonLd
        data={[
          calculatorJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: TITLE, path: PATH },
          ]),
          howToJsonLd({
            name: "How to calculate your Zakat with this calculator",
            description: "The steps the Islamic Ḥisāb Zakat calculator follows, from choosing a school to reading the breakdown.",
            steps: HOW_STEPS,
          }),
        ]}
      />

      <PageIntro
        hue="indigo"
        breadcrumb={TITLE}
        eyebrow="Zakat al-Māl"
        title={TITLE}
        titleAr="زكاة"
        lead="Work out the Zakat due on your wealth, step by step. Choose your school, enter what you own and what you owe, and see each line of the result with the reasoning behind it."
      />

      <ZakatCalculator />

      <ScholarNote className="mt-6" />

      <div className="mt-10">
        <Toc items={TOC} />
      </div>

      <Section id="what-is-zakat" title="What Zakat is">
        <div className="prose">
          <p>
            Zakat is the yearly charity that a Muslim pays on wealth once it reaches a minimum amount, the{" "}
            <strong>niṣāb</strong>, and has been held for a full lunar year, the <strong>ḥawl</strong>. The Qurʾān pairs
            it with prayer: <em>&ldquo;Establish prayer, pay alms-tax, and bow down with those who bow down&rdquo;</em>{" "}
            (al-Baqarah 2:43).
          </p>
          <p>
            For money, gold, silver, investments and trade goods the rate is 2.5%. Crops are due at harvest at 10% or 5%,
            and grazing livestock has its own scale. The schools of jurisprudence agree on these foundations but differ on
            details, such as worn jewelry, debts and modern retirement accounts. This calculator lets you follow your own
            school on each one.
          </p>
          <p>
            In the Jaʿfarī school, obligatory Zakat applies to nine items only: wheat, barley, dates, raisins, gold coins,
            silver coins, sheep, cattle and camels. Most other wealth falls under <strong>Khums</strong>, 20% of the income
            left after a year&apos;s living expenses. The calculator handles both.
          </p>
        </div>
      </Section>

      <Section id="how-it-works" title="How this calculator works">
        <ol className="list-none p-0 m-0 grid gap-3">
          {HOW_STEPS.map((s, i) => (
            <li key={s.name} className="card p-4 sm:p-5 flex gap-4">
              <span className="mono text-[13px] font-semibold text-text-3 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-semibold text-text">{s.name}</p>
                <p className="mt-1 text-[15px] text-text-2 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="prose mt-8">
          <h3>The details, as the code applies them</h3>
          <ul>
            <li>
              <strong>Niṣāb test.</strong> For the niṣāb test the calculator adds the full value of your cash, metals,
              investments, accounts and other money assets, then subtracts your deductible debts. If the result is below
              the niṣāb, the money lines show zero. Crops and livestock are not part of this test: they have their own
              minimums (five wasqs; 40 sheep, 30 cattle, 5 camels) and are never added to money to reach a niṣāb.
            </li>
            <li>
              <strong>What is counted at 2.5%.</strong> Cash, bank balances, gold and silver at the spot price, zakatable
              jewelry, investments under your chosen stock method, net rental income, property held for sale, business
              cash, stock and receivables, TFSA or Roth IRA, retirement accounts under your chosen approach, vested
              employer match, and crypto unless you exclude it.
            </li>
            <li>
              <strong>Stocks.</strong> Full market value; a zakatable share of market value (30% unless you enter another
              figure); or 10% of dividends received (the method proposed by Yusuf al-Qaraḍāwī).
            </li>
            <li>
              <strong>Retirement accounts that hold funds.</strong> If an account holds equities, only the equity part is
              reduced to its zakatable share. Cash in the account counts in full.
            </li>
            <li>
              <strong>Debts.</strong> When debts are deductible, the calculator lowers every money line that is
              charged by the same proportion: your charged money total after debts divided by the same total before debts.
              Exempt items (such as exempt jewelry or deferred retirement funds) are not part of that total. In the Mālikī
              and Shāfiʿī schools debts never reduce crops or livestock. In the Ḥanafī school they never reduce crops, but
              debts larger than your money reach livestock; in the relied-upon Ḥanbalī view they reduce crops and livestock
              too. The calculator does not work out those two cases: it marks the lines it cannot calculate and tells you
              to ask a scholar. In the Mālikī school a debt reduces money only if you have no other assets to pay it from,
              and the results page says so.
            </li>
            <li>
              <strong>Crops.</strong> 10% for rain-fed crops and 5% for irrigated crops, charged on the harvest value
              you enter. Every preset except the Ḥanafī one applies a minimum of five wasqs, checked against the harvest
              weight in kilograms: 653 kg as this calculator counts it, or about 847 kg for the Jaʿfarī school
              (Sistani). Below it, crops are exempt. If you enter no weight, the minimum is not checked.
            </li>
            <li>
              <strong>Livestock.</strong> Sheep and goats from 40 head, cattle from 30 and camels from 5. The number of
              animals due follows the schedules in the letter of Abū Bakr (Ṣaḥīḥ al-Bukhārī 1454) and the hadith of
              Muʿādh for cattle (a tabīʿ per 30, a musinnah per 40), with each school's rule above 120 camels and
              Sistani's schedule for the Jaʿfarī school. Sheep and cattle due are converted to money with fixed estimates
              built into the code (150 per sheep, 300 per tabīʿ, 500 per musinnah), not market prices. Camels due as
              camels are shown in kind and not priced. If you own livestock, value the animals due at local prices.
            </li>
            <li>
              <strong>Khums (Jaʿfarī).</strong> 20% of annual income minus annual expenses, split equally between Sahm
              al-Imam and Sahm al-Sadat. In this preset cash, investments, retirement accounts, crypto, rental income and
              business assets show no obligatory Zakat.
            </li>
          </ul>
        </div>
      </Section>

      <Section id="worked-example" title="Worked example">
        <div className="callout callout-warning text-[14.5px] mb-5">
          <p className="text-text-2 leading-relaxed">
            <strong className="text-text">Example only.</strong> The prices here are example figures, not current
            market prices: gold <span className="num">{usd(EXAMPLE_GOLD_PER_GRAM)}</span> per gram and silver{" "}
            <span className="num">{usd(EXAMPLE_SILVER_PER_GRAM)}</span> per gram. The numbers below were produced by the
            same calculation code the calculator uses.
          </p>
        </div>

        <p className="text-text-2 leading-relaxed mb-4">
          A person who follows the Ḥanafī preset (silver niṣāb, worn jewelry zakatable, full market value for shares, 12
          months of loan principal deducted) has held the following for a lunar year:
        </p>
        <div className="table-wrap mb-6" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <caption className="sr-only">Example inputs</caption>
            <thead>
              <tr>
                <th scope="col">Input</th>
                <th scope="col" className="num">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_INPUT_ROWS.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="num">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <caption className="sr-only">Example result, Ḥanafī preset</caption>
            <thead>
              <tr>
                <th scope="col">Line</th>
                <th scope="col" className="num">
                  Amount
                </th>
                <th scope="col" className="num">
                  Zakat
                </th>
              </tr>
            </thead>
            <tbody>
              {example.breakdown
                .filter((b) => b.amount !== 0)
                .map((b, i) => (
                  <tr key={i}>
                    <td>{tidyDash(b.category)}</td>
                    <td className="num">
                      {b.amount < 0 ? "-" : ""}
                      {usd(Math.abs(b.amount))}
                    </td>
                    <td className="num">{b.amount < 0 ? "" : usd(b.zakatDue)}</td>
                  </tr>
                ))}
              <tr>
                <td>Niṣāb ({SILVER_NISAB_GRAMS_DISPLAY} g of silver)</td>
                <td className="num">{usd(example.nisabThreshold)}</td>
                <td className="num">{example.meetsNisab ? "Met" : "Not met"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Zakatable amount after debts</strong>
                </td>
                <td className="num">
                  <strong>{usd(example.totalZakatableWealth)}</strong>
                </td>
                <td className="num">
                  <strong>{usd(example.totalZakatDue)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[15px] text-text-2 leading-relaxed">
          The debts total <span className="num">{usd(1200 + 12 * 500)}</span> (the card balance plus 12 months of
          principal). They lower each line in proportion, so the Zakat equals 2.5% of{" "}
          <span className="num">{usd(example.totalZakatableWealth)}</span>, which is{" "}
          <span className="num">{usd(example.totalZakatDue)}</span>.
        </p>

        <h3 className="text-[18.5px] font-[650] mt-8 mb-3">The same person under each school&apos;s preset</h3>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <caption className="sr-only">Example result by school preset</caption>
            <thead>
              <tr>
                <th scope="col">School preset</th>
                <th scope="col" className="num">
                  Niṣāb
                </th>
                <th scope="col" className="num">
                  Zakat due
                </th>
              </tr>
            </thead>
            <tbody>
              {exampleBySchool.map(({ m, r }) => (
                <tr key={m}>
                  <td>{MADHAB_INFO[m].name}</td>
                  <td className="num">{usd(r.nisabThreshold)}</td>
                  <td className="num">{usd(r.totalZakatDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[15px] text-text-2 leading-relaxed">
          The differences come from the settings, not from errors. The other Sunni presets use the gold niṣāb, exempt
          worn jewelry and count only a zakatable share of shares. The Shāfiʿī preset does not deduct debts. The Jaʿfarī
          preset shows no obligatory Zakat on cash, shares or the TFSA; that wealth would fall under Khums instead.
        </p>
      </Section>

      <Section id="who-receives" title="Who can receive Zakat">
        <div className="prose">
          <p>The Qurʾān names eight groups who may receive Zakat:</p>
          <blockquote>
            <p className="text-[22px] text-text mb-2">
              <Ar>إِنَّمَا ٱلصَّدَقَٰتُ لِلۡفُقَرَآءِ وَٱلۡمَسَٰكِينِ</Ar>
            </p>
            <p>
              &ldquo;Alms-tax is only for the poor and the needy, for those employed to administer it, for those whose
              hearts are attracted ˹to the faith˺, for ˹freeing˺ slaves, for those in debt, for Allah&apos;s cause, and
              for ˹needy˺ travellers. ˹This is˺ an obligation from Allah. And Allah is All-Knowing, All-Wise.&rdquo;
              (at-Tawbah 9:60, translation by Dr. Mustafa Khattab, <em>The Clear Quran</em>)
            </p>
          </blockquote>
          <ol>
            <li>The poor (al-fuqarāʾ)</li>
            <li>The needy (al-masākīn)</li>
            <li>Those employed to collect and distribute Zakat</li>
            <li>Those whose hearts are to be reconciled</li>
            <li>Freeing those in bondage</li>
            <li>Those in debt</li>
            <li>In the cause of Allah</li>
            <li>The stranded traveller</li>
          </ol>
          <p>
            Schools differ on some details of each group, so a local Zakat organization or scholar can help you choose
            where to give. For Khums in Jaʿfarī fiqh, the site&apos;s notes explain that Sahm al-Sadat goes to needy
            descendants of the Prophet ﷺ, who cannot receive regular Zakat.
          </p>
        </div>
      </Section>

      <Section id="faq" title="Questions">
        <Faq
          items={FAQ.map((f) =>
            f.q === "Which school should I choose?"
              ? {
                  ...f,
                  body: (
                    <p>
                      Choose the school you follow. If you are not sure, the{" "}
                      <Link href="/find-your-school">short quiz on this site</Link> can help you find it. Each preset fills
                      in that school&apos;s position on every question, and you can still change any single setting. If
                      you change one, the calculator labels your setup as Custom so the result is clear about what it is
                      based on.
                    </p>
                  ),
                }
              : f
          )}
        />
      </Section>

      <Section id="related" title="Related tools">
        <RelatedTools current={PATH} />
        <p className="mt-4 text-[15px] text-text-2">
          New to the terms? See the{" "}
          <Link href="/glossary" className="lnk">
            glossary
          </Link>{" "}
          and the{" "}
          <Link href="/about" className="lnk">
            methodology page
          </Link>
          .
        </p>
      </Section>

      <Sources>
        <ul className="list-disc ps-5 m-0 space-y-1">
          <li>
            Qurʾān 2:43 and 9:60, English translation by Dr. Mustafa Khattab (<em>The Clear Quran</em>), via{" "}
            <a className="lnk" href="https://quran.com/2/43">
              quran.com/2/43
            </a>{" "}
            and{" "}
            <a className="lnk" href="https://quran.com/9/60">
              quran.com/9/60
            </a>
            .
          </li>
          <li>
            School positions as summarised in this site&apos;s scholarly notes, which cite: Fiqh Council of North America
            (2024 fatwā on retirement funds); National Zakat Foundation Canada; Dr. Monzer Kahf; Sheikh Ahmad Kutty
            (Islamic Institute of Toronto); Zakat.org; AAOIFI and the International Islamic Fiqh Academy (stocks); Yusuf
            al-Qaraḍāwī, <em>Fiqh al-Zakāh</em>; Ibn Qudāma, <em>al-Mughnī</em>; al-Nawawī, <em>Rawḍat al-Ṭālibīn</em>;
            al-Shirbīnī, <em>Mughnī al-Muḥtāj</em>; al-Ruʿaynī, <em>Mawāhib al-Jalīl</em>; al-Jundī,{" "}
            <em>Mukhtaṣar Khalīl</em>; Ayatollah Sistani (Khums).
          </li>
          <li>
            Gold and silver prices: Yahoo Finance quotes for gold and silver futures, fetched by this site and converted
            to grams. Exchange rates: open.er-api.com.
          </li>
        </ul>
      </Sources>
    </div>
  );
}

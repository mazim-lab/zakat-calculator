import Link from "next/link";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, SITE, TOOLS } from "@/lib/site";
import { MADHAB_PRESETS, type MethodologyChoices } from "@/lib/types";
import { FALLBACK_PRICES_AS_OF_LABEL } from "@/lib/metal-fallback";
import { PageIntro, Section, Toc, JsonLd, ScholarNote, Callout } from "@/components/ui";

const PATH = "/about";
const TITLE = "About and Methodology";
const DESCRIPTION =
  "What Islamic Ḥisāb does, how the school presets work, where gold, silver and exchange-rate figures come from, what stays private, and the limits of each calculator.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

type PresetKey = keyof typeof MADHAB_PRESETS;
type Setting = keyof Omit<MethodologyChoices, "madhab">;

const SCHOOL_COLUMNS: { key: PresetKey; name: string }[] = [
  { key: "hanafi", name: "Ḥanafī" },
  { key: "maliki", name: "Mālikī" },
  { key: "shafii", name: "Shāfiʿī" },
  { key: "hanbali", name: "Ḥanbalī" },
  { key: "jafari", name: "Jaʿfarī" },
];

// Human labels for each preset setting and value (values from src/lib/types.ts).
const SETTING_LABELS: { key: Setting; label: string; values: Record<string, string> }[] = [
  { key: "nisabStandard", label: "Niṣāb standard", values: { gold: "Gold", silver: "Silver" } },
  { key: "jewelryZakatable", label: "Worn jewelry zakatable", values: { true: "Yes", false: "No" } },
  { key: "combineGoldSilver", label: "Combine gold and silver", values: { true: "Yes", false: "No" } },
  {
    key: "stockMethod",
    label: "Stocks and funds",
    values: {
      full_market_value: "Full market value",
      zakatable_assets: "Zakatable assets share",
      dividends_only: "Dividends only",
      cri_approximation: "30% approximation",
    },
  },
  {
    key: "rrspApproach",
    label: "RRSP / 401(k)",
    values: {
      full_balance: "Full balance",
      net_after_tax: "Net after tax",
      defer_to_withdrawal: "Defer to withdrawal",
      exclude: "Excluded",
    },
  },
  {
    key: "debtDeduction",
    label: "Debts",
    values: {
      twelve_months_principal: "Short-term + 12 months of principal",
      single_installment: "Short-term + one installment",
      hidden_wealth_only: "From hidden wealth only",
      no_deduction: "Not deducted",
    },
  },
  {
    key: "cryptoTreatment",
    label: "Cryptocurrency",
    values: { like_cash: "Like cash", like_trade_goods: "Like trade goods", not_zakatable: "Not zakatable" },
  },
  { key: "yearType", label: "Year", values: { lunar: "Lunar", solar: "Solar" } },
  {
    key: "agriculturalMinimum",
    label: "Minimum for crops (5 wasqs)",
    values: { true: "Applies", false: "Any amount" },
  },
];

const TOC = [
  { id: "what", label: "What this site does" },
  { id: "presets", label: "How the school presets work" },
  { id: "prices", label: "Where prices and exchange rates come from" },
  { id: "method", label: "How results are worked out" },
  { id: "privacy", label: "Privacy" },
  { id: "limits", label: "Limitations" },
  { id: "scholars", label: "Ask a scholar" },
  { id: "errors", label: "Reporting an error" },
];

const ISSUES_URL = "https://github.com/mazim-lab/zakat-calculator/issues";

export default function AboutPage() {
  return (
    <div className="container-narrow">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            inLanguage: "en",
            isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url + "/" },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About and methodology", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        breadcrumb="About and methodology"
        eyebrow="Reference"
        title="About and methodology"
        lead="How the calculators work, where their figures come from, and what they cannot do. Everything on this page describes what the site's code actually does."
      />

      <Toc items={TOC} />

      <Section id="what" title="What this site does" className="mt-8">
        <div className="prose">
          <p>
            {SITE.name} is a set of free calculators for Islamic financial duties. You can work out:
          </p>
          <ul>
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href}>{t.title}</Link>: {t.summary}
              </li>
            ))}
          </ul>
          <p>
            Each calculator lets you pick one of five schools of Islamic law: Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or
            Jaʿfarī. Where the schools differ, the calculator explains each position and its reasoning, so you can see
            why the numbers come out as they do. If you are not sure which school you follow, the{" "}
            <Link href="/find-your-school">school finder</Link> can suggest one. The{" "}
            <Link href="/glossary">glossary</Link> explains the Arabic terms.
          </p>
        </div>
      </Section>

      <Section id="presets" title="How the school presets work">
        <div className="prose">
          <p>
            In the Zakat calculator, choosing a school fills in nine settings at once. The table shows each preset as
            it is set in the code. You can change any single setting. As soon as one setting differs from the preset,
            the calculator switches the label to &quot;Custom&quot;.
          </p>
        </div>
        <div className="table-wrap mt-5" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <caption className="sr-only">Zakat calculator presets by school</caption>
            <thead>
              <tr>
                <th scope="col">Setting</th>
                {SCHOOL_COLUMNS.map((s) => (
                  <th key={s.key} scope="col">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SETTING_LABELS.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="!normal-case !tracking-normal !text-[16.5px] !font-semibold !text-text !bg-surface">
                    {row.label}
                  </th>
                  {SCHOOL_COLUMNS.map((s) => {
                    const v = String(MADHAB_PRESETS[s.key][row.key]);
                    return (
                      <td key={s.key} className="text-text-2">
                        {row.values[v] ?? v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prose mt-5">
          <p>
            The classical works of the schools came long before retirement accounts, index funds and cryptocurrency.
            For those items, the presets apply positions of contemporary scholars and bodies. Each position is named in
            the explanation panel next to the setting, so you can check it.
          </p>
          <p>
            In the Jaʿfarī preset, cash, investments, retirement accounts and cryptocurrency carry no obligatory Zakat.
            The calculator covers that wealth through Khums instead: 20% of the income left after a year&apos;s
            expenses.
          </p>
          <p>
            The other calculators use each school&apos;s own measures directly: the size of the ṣāʿ for Zakat al-Fiṭr,
            the mudd for fidya, which options a kaffārah allows and in what order, and the inheritance rules where the
            schools differ (for example ʿawl, radd, and a grandfather inheriting with siblings).
          </p>
        </div>
      </Section>

      <Section id="prices" title="Where prices and exchange rates come from">
        <div className="prose">
          <p>
            Only the Zakat calculator uses live market figures. It needs the price of gold and silver to work out the
            niṣāb and to value any metal you own.
          </p>
          <ul>
            <li>
              <strong>Gold and silver.</strong> The site&apos;s own server asks Yahoo Finance for the latest gold
              futures (GC=F) and silver futures (SI=F) prices in US dollars per troy ounce. It converts them to a price
              per gram using 31.1035 grams per troy ounce. The result is cached for about an hour, so the price you see
              can be an hour old or a little more.
            </li>
            <li>
              <strong>If the price source is unreachable.</strong> The calculator falls back to a fixed price stored in
              the code. That fallback was taken from the same Yahoo Finance source on {FALLBACK_PRICES_AS_OF_LABEL}, so it
              may be far from today&apos;s price. The calculator tells you whether it is showing a live price or the
              fallback, and the date of the fallback.
            </li>
            <li>
              <strong>Exchange rates.</strong> To show amounts in your currency, your browser loads exchange rates against
              the US dollar from open.er-api.com.
            </li>
          </ul>
          <p>
            The Zakat al-Fiṭr, fidya and kaffārah calculators do not use market data. They ask you for the local price
            of staple food or of a meal, because food prices differ so much from place to place. The amounts already in
            those boxes are examples only. The inheritance calculator works in fractions of the estate, so it needs no
            prices.
          </p>
        </div>
      </Section>

      <Section id="method" title="How results are worked out">
        <div className="prose">
          <h3>Zakat</h3>
          <ul>
            <li>
              The niṣāb is 85 g of gold or 595 g of silver, at the price above, depending on the standard you choose.
              For the Jaʿfarī school it is Ayatollah Sistani&apos;s 69.12 g of gold or 105 ṣayrafī mithqāls of silver.
              Sistani gives no gram figure for silver; the calculator uses 483.84 g, a derived conversion at the 4.608 g
              per mithqāl given in his Islamic Laws glossary (his Summary of the Rules of Worship says about 487 g).
            </li>
            <li>
              Most zakatable wealth is charged at 2.5%. Crops are charged at 10% if rain-fed or 5% if irrigated, on the
              harvest value, with the five-wasq minimum checked against the harvest weight. Livestock is counted by head
              against the schedules in the letter of Abū Bakr (Ṣaḥīḥ al-Bukhārī 1454) and the hadith of Muʿādh (Sunan Abī Dāwūd 1576), or
              Sistani&apos;s schedules for the Jaʿfarī school.
            </li>
            <li>
              Debts, where your settings allow them, reduce the money you are charged on (not exempt items) before the
              2.5% is applied. Only the principal of a loan counts, never the interest. Where your school also lets debts
              reduce crops or livestock (Ḥanafī for livestock, Ḥanbalī for both), the calculator does not work out that
              split and marks those lines as not calculated.
            </li>
            <li>
              The niṣāb test uses your money wealth after any allowed debts. Crops and livestock have their own
              minimums and are never added to money to reach a niṣāb, so they can be due when money is not.
            </li>
            <li>If you choose a solar year instead of a lunar one, most amounts are multiplied by 1.0307.</li>
            <li>
              Worn gold jewelry is valued below the spot price, using the share of spot that a dealer pays back for
              each karat. The ratios come from a Canadian dealer&apos;s published buyback prices (March 2026).
            </li>
          </ul>
          <h3>Zakat al-Fiṭr and fidya</h3>
          <p>
            The amount per person (or per missed day) is the school&apos;s measure of food multiplied by the food price
            you enter, or simply the local cash amount you enter.
          </p>
          <h3>Kaffārah</h3>
          <p>
            The calculator lists the options your school requires, in order where the order matters. Where feeding
            is an option, its cost is the number of people to feed (10 for a broken oath, 60 for the other cases)
            times the meal cost you enter. For accidental killing the four Sunni schools have no feeding option, so no
            cost is shown for them.
          </p>
          <h3>Inheritance</h3>
          <p>
            Shares are worked out as exact fractions, then applied to the estate you enter. The calculator applies
            ḥajb (exclusion), the fixed shares of Qurʾān 4:11, 4:12 and 4:176, the residuary heirs (ʿaṣabah: sons and
            their sons, the father, the grandfather, then full and paternal brothers with their sisters, and sisters
            beside daughters, following Ṣaḥīḥ al-Bukhārī 6732 and 6736), and then ʿawl or radd where the shares do not
            add up to exactly the whole estate. For a grandfather with siblings it follows the selected school: the
            Ḥanafī exclusion, or Zayd ibn Thābit&apos;s method for the other three. The Jaʿfarī school follows its own
            class system, with no ʿaṣabah and no ʿawl, as set out in Ayatollah Sistani&apos;s rulings; where Sistani
            leaves part of an estate to be settled by agreement between the heirs, the calculator shows that part
            unassigned. Every rule is checked by automated tests against more than 60 classical cases, each with its
            source.
          </p>
          <h3>How the rules were checked</h3>
          <p>
            We reviewed every calculator against the Qurʾān, authentic hadith, recognised references for each school
            and, for the Jaʿfarī school, Ayatollah Sistani&apos;s published rulings. The review was done by the
            site&apos;s maintainers with AI assistance, against the sources cited. No scholar reviewed it, and it is not
            a scholarly endorsement.
          </p>
        </div>
      </Section>

      <Section id="privacy" title="Privacy">
        <div className="prose">
          <ul>
            <li>
              <strong>Your figures stay on your device.</strong> Every calculation runs in your browser. The amounts,
              heirs and answers you enter are not sent to any server and are not saved.
            </li>
            <li>
              <strong>Prices and rates.</strong> To fetch prices, your browser contacts this site&apos;s own price
              service and open.er-api.com. These requests carry no information about what you entered.
            </li>
            <li>
              <strong>Hosting.</strong> The site is served through Cloudflare, which processes request data such as IP
              addresses to deliver and protect the site.
            </li>
            <li>
              <strong>Visit counts.</strong> The site uses Cloudflare Web Analytics to count visits and measure how fast
              pages load. Cloudflare says this uses no cookies or local storage, does not fingerprint visitors, and does
              not track you across sites. It never sees the figures you enter.
            </li>
            <li>
              <strong>Translation.</strong> Google Translate is loaded only when you pick a language from the language
              menu. The page is then translated by Google, so its text, including any results on screen, is sent to
              Google. If you never use the menu, nothing is loaded from Google.
            </li>
            <li>
              <strong>Stored in your browser.</strong> Your light or dark theme choice is kept in your browser&apos;s
              local storage. The site also keeps a copy of the main pages in your browser so they can open without a
              connection.
            </li>
          </ul>
        </div>
      </Section>

      <Section id="limits" title="Limitations">
        <div className="prose">
          <ul>
            <li>
              The calculators cover common situations. They are not a complete statement of any school&apos;s law,
              and each school has internal differences that a single preset cannot show.
            </li>
            <li>
              Gold and silver prices can be an hour or more old, or a fixed fallback if the source is down. Before you
              pay, check the prices the calculator shows against a dealer near you.
            </li>
            <li>
              Livestock Zakat is valued with fixed approximate amounts per sheep and per cow, and camels due as camels
              are shown in kind without a price. If you own livestock, confirm the result with a scholar.
            </li>
            <li>
              The inheritance calculator covers spouses, children, a son&apos;s children, parents, the paternal
              grandfather, both grandmothers, and full and half siblings. It does not cover a daughter&apos;s children, a
              maternal grandfather or more distant relatives such as uncles, aunts, nephews or cousins.
            </li>
            <li>
              The calculators do not deal with local tax or estate law. Where local law applies, you may also need a
              lawyer, accountant or tax adviser.
            </li>
            <li>Machine translation can change the meaning of religious terms. The English page is the reference.</li>
          </ul>
        </div>
      </Section>

      <Section id="scholars" title="Ask a scholar">
        <ScholarNote />
        <p className="mt-4 text-[15.5px] text-text-2 leading-relaxed">
          The explanations restate positions found in the works and bodies they name. They are a starting point for a
          conversation with someone qualified, not the end of it.
        </p>
      </Section>

      <Section id="errors" title="Reporting an error">
        <Callout tone="neutral" title="Report a problem">
          If you find a mistake in a calculation or a ruling, we want to fix it. Please{" "}
          <a className="lnk" href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
            report a problem on the project&apos;s public issue tracker
          </a>
          . It helps to include the page, the figures you entered and what you expected to see. Please do not post
          personal details.
        </Callout>
      </Section>
    </div>
  );
}

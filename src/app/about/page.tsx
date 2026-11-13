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
                  <th scope="row" className="!normal-case !tracking-normal !text-[14px] !font-semibold !text-text !bg-surface">
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
            <li>The niṣāb is 85 g of gold or 595 g of silver, at the price above, depending on the standard you choose.</li>
            <li>
              Most zakatable wealth is charged at 2.5%. Crops are charged at 10% if rain-fed or 5% if irrigated.
              Livestock is counted by head against the classical thresholds.
            </li>
            <li>
              Debts, where your settings allow them, reduce your zakatable wealth before the 2.5% is applied. Only the
              principal of a loan counts, never the interest.
            </li>
            <li>The niṣāb test uses your total wealth after any allowed debts.</li>
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
            times the meal cost you enter.
          </p>
          <h3>Inheritance</h3>
          <p>
            Shares are worked out as exact fractions, then applied to the estate you enter. The calculator applies
            ḥajb (exclusion), the fixed shares, the residuary heirs (ʿaṣabah), and then ʿawl or radd where the shares
            do not add up to exactly the whole estate. The Jaʿfarī school follows its own class system, with no
            ʿaṣabah and no ʿawl.
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
              <strong>Analytics.</strong> The site uses Vercel Web Analytics and Vercel Speed Insights for anonymous
              page metrics, such as page views and how fast pages load.
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
              Livestock Zakat is valued with fixed approximate amounts per animal, and the camel rules are simplified
              for herds of 25 or more. If you own livestock, confirm the result with a scholar.
            </li>
            <li>
              The inheritance calculator covers spouses, children, a son&apos;s children, parents, grandparents and
              siblings. It does not cover more distant relatives such as uncles, aunts, nephews or cousins.
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
        {/* TODO(owner): add a real way to report errors (contact form or email address),
            then replace the paragraph below. No contact address exists in the codebase yet,
            so none is shown here on purpose. */}
        <Callout tone="neutral" title="There is no contact form yet">
          If you find a mistake in a calculation or a ruling, we want to fix it. A way to report errors through this site
          has not been set up yet. When it is, it will be listed here. If you report a problem, it helps to include
          the page, the figures you entered and what you expected to see.
        </Callout>
      </Section>
    </div>
  );
}

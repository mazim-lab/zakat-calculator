import Link from "next/link";
import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd, howToJsonLd } from "@/lib/seo";
import { PageIntro, Callout, ScholarNote, Section, Faq, RelatedTools, Sources, JsonLd } from "@/components/ui";
import { FITR_AMOUNTS, type Madhab } from "@/lib/zakat-fitr/types";
import { calculateFitr } from "@/lib/zakat-fitr/calculate";
import { ZakatFitrCalculator } from "./ZakatFitrCalculator";

const PATH = "/zakat-fitr";
const TITLE = "Zakat al-Fiṭr Calculator";
const DESCRIPTION =
  "Work out Zakat al-Fiṭr for your household before Eid, by food weight or local cash amount, with the per-person measure of each of the five schools.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const SCHOOLS: { value: Madhab; label: string }[] = [
  { value: "hanafi", label: "Ḥanafī" },
  { value: "maliki", label: "Mālikī" },
  { value: "shafii", label: "Shāfiʿī" },
  { value: "hanbali", label: "Ḥanbalī" },
  { value: "jafari", label: "Jaʿfarī" },
];

// Worked example inputs. These are EXAMPLE figures only, not current prices or official amounts.
const EX_ADULTS = 2;
const EX_CHILDREN = 3;
const EX_PEOPLE = EX_ADULTS + EX_CHILDREN;
const EX_PRICE_PER_KG = 2; // example price per kg of staple food
const EX_CASH_PER_PERSON = 12; // example local per-person amount

// Computed at build time with the same function the calculator uses.
const exampleWeightRows = SCHOOLS.map((s) => ({
  ...s,
  info: FITR_AMOUNTS[s.value],
  result: calculateFitr({
    fitrInfo: FITR_AMOUNTS[s.value],
    totalPeople: EX_PEOPLE,
    useWeight: true,
    pricePerKg: EX_PRICE_PER_KG,
    costPerPerson: EX_CASH_PER_PERSON,
  })!,
}));
const exampleCash = calculateFitr({
  fitrInfo: FITR_AMOUNTS.hanafi,
  totalPeople: EX_PEOPLE,
  useWeight: false,
  pricePerKg: EX_PRICE_PER_KG,
  costPerPerson: EX_CASH_PER_PERSON,
})!;

const FAQ = [
  {
    q: "Is Zakat al-Fiṭr the same as my annual Zakat?",
    a: "No. Annual Zakat (Zakat al-Māl) is 2.5% of zakatable wealth held for a year above the niṣāb. Zakat al-Fiṭr is a fixed amount per person, paid once at the end of Ramadan, whatever your total wealth.",
  },
  {
    q: "Who do I pay Zakat al-Fiṭr for?",
    a: "In the Mālikī, Shāfiʿī and Ḥanbalī schools you pay for yourself, your spouse, your minor children and any dependents you must support, including infants born before the Eid prayer. In the Ḥanafī school a husband is not obliged to pay for his wife (she pays her own if she owns the niṣāb), and the duty itself falls only on someone who owns the niṣāb beyond basic needs, while the other schools require only food beyond the day and night of Eid. The Jaʿfarī school also includes guests who are in your home at sunset on the eve of Eid.",
  },
  {
    q: "How much is it per person?",
    a: "It is measured in ṣāʿ, a prophetic unit of volume. In this calculator the Ḥanafī amount is half a ṣāʿ of wheat (about 1.6 kg). The Mālikī, Shāfiʿī and Ḥanbalī amount is one ṣāʿ of the local staple (about 2.5 kg). The Jaʿfarī amount is one ṣāʿ of commonly eaten food (about 3 kg).",
  },
  {
    q: "Can I pay in cash instead of food?",
    a: "The Ḥanafī and Jaʿfarī schools permit the cash equivalent. The classical Mālikī, Shāfiʿī and Ḥanbalī position is that actual food is given, though many contemporary scholars and most Islamic charities accept cash and buy food on your behalf. If this matters to you, ask a scholar of your school.",
  },
  {
    q: "When is it due?",
    a: "All schools agree it must be paid before the Eid prayer. The Ḥanafī school ties the obligation to dawn on Eid day; the Mālikī, Shāfiʿī, Ḥanbalī and Jaʿfarī schools tie it to sunset on the last day of Ramadan. Paying a few days early, so the recipient can use it for Eid, is widely recommended. Paid after the Eid prayer, it counts as ordinary charity (ṣadaqah).",
  },
  {
    q: "Who can receive it?",
    a: "The same categories as Zakat al-Māl, including the poor (fuqarāʾ) and the needy (masākīn). Its main purpose is that poor people can celebrate Eid with dignity.",
  },
];

export default function Page() {
  return (
    <div className="container-narrow pb-16">
      <JsonLd
        data={[
          calculatorJsonLd({ path: PATH, name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Zakat al-Fiṭr", path: PATH },
          ]),
          howToJsonLd({
            name: "How to calculate Zakat al-Fiṭr",
            description: "Count everyone you pay for, choose the per-person amount for your school, and multiply.",
            steps: [
              { name: "Choose your school", text: "Select Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī. This sets the food weight per person." },
              { name: "Count your household", text: "Add yourself, your spouse, your children (including infants) and other dependents." },
              { name: "Set the amount per person", text: "Enter a local per-person amount, or the price of 1 kg of staple food so the calculator multiplies it by your school's weight." },
              { name: "Read the total", text: "The total is the per-person amount multiplied by the number of people. Pay it before the Eid prayer." },
            ],
          }),
        ]}
      />

      <PageIntro
        hue="cyan"
        eyebrow="Calculator"
        title={TITLE}
        titleAr="زكاة الفطر"
        breadcrumb="Zakat al-Fiṭr"
        lead="The per-person payment due before the Eid al-Fiṭr prayer. Count your household, pick your school, and see the total by food weight or local cash amount."
      />

      <Callout tone="warning" title="This is not your annual Zakat" className="mb-6">
        Zakat al-Fiṭr (Fiṭrānah) is a separate, per-person payment due before the Eid al-Fiṭr prayer at the end of
        Ramadan. Your annual wealth-based Zakat (Zakat al-Māl) is calculated in the{" "}
        <Link href="/zakat" className="lnk font-semibold">
          Zakat calculator
        </Link>
        .
      </Callout>

      <ZakatFitrCalculator />

      <ScholarNote className="mt-8" />

      <Section id="what" title="What Zakat al-Fiṭr is">
        <div className="prose">
          <p>
            Zakat al-Fiṭr is a small, fixed charity paid at the end of Ramadan. It is due on every Muslim who has more
            than enough food for themselves and their dependents on the day of Eid. The head of the household pays it
            for each person they support.
          </p>
          <p>
            Its basis is the hadith of Ibn ʿUmar in Ṣaḥīḥ al-Bukhārī: &ldquo;Allah&apos;s Messenger (ﷺ) enjoined the
            payment of one Sa&apos; of dates or one Sa&apos; of barley as Zakat-ul-Fitr on every Muslim slave or free,
            male or female, young or old, and he ordered that it be paid before the people went out to offer the
            `Id prayer.&rdquo; (Bukhārī 1503)
          </p>
          <p>
            It has two aims: to purify the fasting person from idle talk and small faults during Ramadan, and to make
            sure poor people can celebrate Eid too.
          </p>
        </div>
      </Section>

      <Section id="how" title="How this calculator works it out">
        <div className="prose">
          <p>The calculator multiplies one per-person amount by the number of people you enter.</p>
          <ul>
            <li>
              <strong>People:</strong> adults, children and other dependents are added together. Each box only accepts
              whole numbers of zero or more.
            </li>
            <li>
              <strong>By local equivalent (cash):</strong> the per-person amount is the figure you type in, for example
              the amount your local mosque publishes this year.
            </li>
            <li>
              <strong>By food weight:</strong> the per-person amount is your school&apos;s weight multiplied by the price
              of 1 kg of staple food that you enter.
            </li>
          </ul>
          <p>The weights used for each school are:</p>
        </div>
        <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col" className="num">kg per person</th>
                <th scope="col">Classical measure</th>
                <th scope="col">Cash permitted?</th>
              </tr>
            </thead>
            <tbody>
              {exampleWeightRows.map((r) => (
                <tr key={r.value}>
                  <td className="font-medium text-text">{r.label}</td>
                  <td className="num">{r.info.weightKg}</td>
                  <td className="text-text-2">{r.info.measure}</td>
                  <td className="text-text-2">{r.info.cashPermitted ? "Yes" : "Classically no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-hint">
          The Ḥanafī figure is the wheat amount. The Ḥanafī measure for barley, dates or raisins is a full ṣāʿ (about
          3.2 kg); this calculator uses the wheat figure in food-weight mode.
        </p>
      </Section>

      <Section id="example" title="Worked example">
        <div className="prose">
          <p>
            A household of <strong>{EX_ADULTS} adults and {EX_CHILDREN} children</strong> ({EX_PEOPLE} people). The
            prices below are <strong>examples only</strong>, not current or official amounts. Use your own local
            figures in the calculator.
          </p>
          <p>
            <strong>Cash, example amount ${EX_CASH_PER_PERSON.toFixed(2)} per person:</strong>{" "}
            <span className="num">{exampleCash.method}</span>, so the total is{" "}
            <span className="num">
              ${exampleCash.perPerson.toFixed(2)} × {exampleCash.totalPeople} = ${exampleCash.total.toFixed(2)}
            </span>
            .
          </p>
          <p>
            <strong>Food weight, example price ${EX_PRICE_PER_KG.toFixed(2)} per kg:</strong>
          </p>
        </div>
        <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col">Per person</th>
                <th scope="col" className="num">Total for {EX_PEOPLE}</th>
              </tr>
            </thead>
            <tbody>
              {exampleWeightRows.map((r) => (
                <tr key={r.value}>
                  <td className="font-medium text-text">{r.label}</td>
                  <td className="num text-text-2">{r.result.method}</td>
                  <td className="num">${r.result.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-hint">Amounts are shown with a $ sign. Enter figures in your own currency; the arithmetic is the same.</p>
      </Section>

      <Section id="faq" title="Questions people ask">
        <Faq items={FAQ} />
      </Section>

      <Section id="related" title="Related calculators">
        <RelatedTools current={PATH} />
      </Section>

      <Sources>
        <p>
          Ṣaḥīḥ al-Bukhārī 1503, narrated by Ibn ʿUmar (Book of Zakat):{" "}
          <a href="https://sunnah.com/bukhari:1503" className="lnk" rel="noopener" target="_blank">
            sunnah.com/bukhari:1503
          </a>
          .
        </p>
        <p className="mt-1">
          School positions on amount, timing, cash and who pays are summarised from this site&apos;s scholarly notes,
          shown in the &ldquo;What do the scholars say?&rdquo; panels in the calculator above.
        </p>
      </Sources>
    </div>
  );
}

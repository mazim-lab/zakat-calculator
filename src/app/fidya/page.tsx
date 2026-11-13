import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd, howToJsonLd } from "@/lib/seo";
import { PageIntro, ScholarNote, Section, Faq, RelatedTools, Sources, JsonLd } from "@/components/ui";
import { FIDYA_WEIGHTS, type Madhab } from "@/lib/fidya/types";
import { calculateFidya } from "@/lib/fidya/calculate";
import { FidyaCalculator } from "./FidyaCalculator";

const PATH = "/fidya";
const TITLE = "Fidya Calculator for Missed Fasts";
const DESCRIPTION =
  "Calculate fidya for Ramadan fasts you cannot make up due to old age or permanent illness, per day by school, by food weight or local meal cost.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const SCHOOLS: { value: Madhab; label: string }[] = [
  { value: "hanafi", label: "Ḥanafī" },
  { value: "maliki", label: "Mālikī" },
  { value: "shafii", label: "Shāfiʿī" },
  { value: "hanbali", label: "Ḥanbalī" },
  { value: "jafari", label: "Jaʿfarī" },
];

// Worked example inputs. EXAMPLE figures only, not current prices.
const EX_DAYS = 30;
const EX_PRICE_PER_KG = 2; // example price per kg of staple food
const EX_MEAL = 10; // example cost of one meal

// Computed at build time with the same function the calculator uses.
const weightRows = SCHOOLS.map((s) => ({
  ...s,
  wheat: calculateFidya({ madhab: s.value, missedDays: EX_DAYS, costPerMeal: EX_MEAL, useWeight: true, pricePerKg: EX_PRICE_PER_KG, foodType: "wheat" })!,
  dates: calculateFidya({ madhab: s.value, missedDays: EX_DAYS, costPerMeal: EX_MEAL, useWeight: true, pricePerKg: EX_PRICE_PER_KG, foodType: "dates" })!,
}));
const mealExample = calculateFidya({ madhab: "hanafi", missedDays: EX_DAYS, costPerMeal: EX_MEAL, useWeight: false, pricePerKg: EX_PRICE_PER_KG, foodType: "wheat" })!;

const kg = (m: Madhab, f: "wheat" | "barley" | "dates" | "raisins" | "rice") => FIDYA_WEIGHTS[m].getWeightKg(f);

const FAQ = [
  {
    q: "Who pays fidya?",
    a: "Someone who cannot fast and has no reasonable expectation of being able to make the fasts up later, such as an elderly person or someone with a chronic or terminal illness. All schools agree on these cases.",
  },
  {
    q: "I was ill for a few days. Do I pay fidya?",
    a: "No. If the illness is temporary, or you missed fasts while travelling, you make up (qaḍāʾ) the missed days later. Fidya is only for when making up the fasts is not possible.",
  },
  {
    q: "I broke my fast on purpose. Is fidya enough?",
    a: "No. Fidya is for inability to fast. A deliberately broken Ramadan fast is a separate matter that may require kaffārah, depending on your school. Use the kaffārah calculator for that.",
  },
  {
    q: "How much is fidya per day?",
    a: "It is feeding one poor person for each missed day. In this calculator, the Ḥanafī amount is half a ṣāʿ of wheat (about 1.6 kg) or a full ṣāʿ of barley, dates or raisins (about 3.2 kg). The Mālikī and Shāfiʿī amount is one mudd of the local staple (about 0.51 kg). The Ḥanbalī amount is one mudd of wheat (about 0.51 kg) or half a ṣāʿ of other staples (about 1.6 kg). The Jaʿfarī amount is one mudd of food (about 0.75 kg).",
  },
  {
    q: "Can I pay fidya in cash?",
    a: "The Ḥanafī school permits the cash equivalent, and the Jaʿfarī notes on this site mention a monetary equivalent too. The Shāfiʿī school strongly prefers actual food, though many contemporary scholars allow cash when it is more practical for the poor. Many scholars today suggest the cost of one average local meal per missed day.",
  },
  {
    q: "What about pregnant or nursing women?",
    a: "Schools differ. In the Ḥanafī school they make up the missed fasts later, and fidya alone is not enough unless they are permanently unable to fast. In the Shāfiʿī and Ḥanbalī schools, if they broke the fast out of fear for the child, they make up the fasts and also pay fidya; if the fear was only for themselves, only the make-up fasts are required.",
  },
  {
    q: "Can I give all the fidya to one person?",
    a: "The calculator treats each missed day as feeding one poor person. This site's guidance is that it can be different people, or the same person on different days.",
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
            { name: "Fidya", path: PATH },
          ]),
          howToJsonLd({
            name: "How to calculate fidya",
            description: "Count the fasts you cannot make up, set the daily amount for your school, and multiply.",
            steps: [
              { name: "Choose your school", text: "Select Ḥanafī, Mālikī, Shāfiʿī, Ḥanbalī or Jaʿfarī. This sets the food weight per day." },
              { name: "Enter the missed days", text: "Count every fasting day you cannot make up, including earlier years not yet compensated." },
              { name: "Set the daily amount", text: "Enter the local cost of one meal, or the price of 1 kg of staple food so the calculator multiplies it by your school's weight." },
              { name: "Read the total", text: "The total is the daily amount multiplied by the number of days." },
            ],
          }),
        ]}
      />

      <PageIntro
        hue="green"
        eyebrow="Calculator"
        title={TITLE}
        titleAr="فِدْيَة"
        breadcrumb="Fidya"
        lead="Compensation for missed fasts. For Ramadan fasts you cannot make up because of old age, chronic illness or another permanent condition."
      />

      <FidyaCalculator />

      <ScholarNote className="mt-8" />

      <Section id="what" title="What fidya is">
        <div className="prose">
          <p>
            Fidya means &ldquo;ransom&rdquo; or &ldquo;compensation&rdquo;. It is feeding one poor person for each day
            of Ramadan that you cannot fast and cannot make up later.
          </p>
          <p>
            Its basis is Qur&apos;an 2:184. In Dr. Mustafa Khattab&apos;s translation (The Clear Quran): &ldquo;For
            those who can only fast with extreme difficulty, compensation can be made by feeding a needy person
            ˹for every day not fasted˺.&rdquo; Scholars agree it applies to people with a permanent inability to fast.
          </p>
          <p>
            Fidya is different from kaffārah. Fidya compensates for <strong>inability</strong> to fast. Kaffārah is
            expiation for a <strong>deliberate</strong> violation, such as breaking a Ramadan fast on purpose.
          </p>
        </div>
      </Section>

      <Section id="how" title="How this calculator works it out">
        <div className="prose">
          <p>The calculator multiplies one daily amount by the number of missed days you enter.</p>
          <ul>
            <li>
              <strong>By local meal cost:</strong> the daily amount is the cost of one meal that you type in.
            </li>
            <li>
              <strong>By food weight:</strong> the daily amount is your school&apos;s weight for the chosen food
              multiplied by the price of 1 kg of that food. The weight only changes with the food type in the Ḥanafī
              and Ḥanbalī schools.
            </li>
          </ul>
          <p>The weights per day used for each school are:</p>
        </div>
        <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col" className="num">Wheat</th>
                <th scope="col" className="num">Rice</th>
                <th scope="col" className="num">Barley, dates, raisins</th>
              </tr>
            </thead>
            <tbody>
              {SCHOOLS.map((s) => (
                <tr key={s.value}>
                  <td className="font-medium text-text">{s.label}</td>
                  <td className="num">{kg(s.value, "wheat")} kg</td>
                  <td className="num">{kg(s.value, "rice")} kg</td>
                  <td className="num">{kg(s.value, "dates")} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="example" title="Worked example">
        <div className="prose">
          <p>
            An elderly person who cannot fast missed <strong>{EX_DAYS} days</strong>. The prices below are{" "}
            <strong>examples only</strong>, not current prices. Use your own local figures in the calculator.
          </p>
          <p>
            <strong>By meal cost, example ${EX_MEAL} per meal:</strong>{" "}
            <span className="num">
              ${mealExample.perDay.toFixed(2)} × {mealExample.missedDays} days = ${mealExample.total.toFixed(2)}
            </span>
            .
          </p>
          <p>
            <strong>By food weight, example price ${EX_PRICE_PER_KG.toFixed(2)} per kg:</strong>
          </p>
        </div>
        <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col">Wheat per day</th>
                <th scope="col" className="num">Wheat, {EX_DAYS} days</th>
                <th scope="col" className="num">Dates, {EX_DAYS} days</th>
              </tr>
            </thead>
            <tbody>
              {weightRows.map((r) => (
                <tr key={r.value}>
                  <td className="font-medium text-text">{r.label}</td>
                  <td className="num text-text-2">
                    {r.wheat.unitDescription} = ${r.wheat.perDay.toFixed(2)}
                  </td>
                  <td className="num">${r.wheat.total.toFixed(2)}</td>
                  <td className="num">${r.dates.total.toFixed(2)}</td>
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
          Qur&apos;an 2:184, translation by Dr. Mustafa Khattab (The Clear Quran):{" "}
          <a href="https://quran.com/2/184" className="lnk" rel="noopener" target="_blank">
            quran.com/2/184
          </a>
          .
        </p>
        <p className="mt-1">
          School positions on amounts, cash and eligibility are summarised from this site&apos;s scholarly notes, shown
          in the &ldquo;What do the scholars say?&rdquo; panels in the calculator above.
        </p>
      </Sources>
    </div>
  );
}

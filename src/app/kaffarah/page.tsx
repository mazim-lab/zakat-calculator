import { pageMetadata, calculatorJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { PageIntro, ScholarNote, Section, Faq, RelatedTools, Sources, JsonLd } from "@/components/ui";
import { KAFFARAH_TYPES, type Madhab } from "@/lib/kaffarah/types";
import { getKaffarahRuling, estimateFeedingCost } from "@/lib/kaffarah/rulings";
import { kaffarahTotalText, kaffarahBreakdownText } from "@/lib/kaffarah/calculate";
import { KaffarahCalculator } from "./KaffarahCalculator";

const PATH = "/kaffarah";
const TITLE = "Kaffārah Calculator";
const DESCRIPTION =
  "Kaffārah options by school for a deliberately broken Ramadan fast, a broken oath, ẓihār or accidental killing, in order, with the feeding cost estimated.";

export const metadata = pageMetadata({ path: PATH, title: TITLE, description: DESCRIPTION });

const SCHOOLS: { value: Madhab; label: string }[] = [
  { value: "hanafi", label: "Ḥanafī" },
  { value: "maliki", label: "Mālikī" },
  { value: "shafii", label: "Shāfiʿī" },
  { value: "hanbali", label: "Ḥanbalī" },
  { value: "jafari", label: "Jaʿfarī" },
];

// Worked example inputs. EXAMPLE figures only, not a current or official meal cost.
const EX_MEAL = 10; // example cost of one meal
const EX_DAYS = 2; // example: two separate days broken

// Computed at build time with the same functions the calculator uses.
const oathEstimate = estimateFeedingCost("broken_oath", "hanafi", EX_MEAL);
const fastEstimate = estimateFeedingCost("broken_fast", "hanafi", EX_MEAL);
const optionRows = KAFFARAH_TYPES.map((t) => ({
  type: t,
  bySchool: SCHOOLS.map((s) => {
    const r = getKaffarahRuling(t.id, s.value);
    return {
      ...s,
      sequential: r.isSequential,
      practical: r.options
        .filter((o) => !o.action.includes("slave"))
        .map((o) => (!r.isSequential && o.isFallback ? `${o.action} (only if unable to do the others)` : o.action)),
    };
  }),
}));

const FAQ = [
  {
    q: "What is the difference between kaffārah and fidya?",
    a: "Fidya compensates for being unable to fast. Kaffārah is expiation for a deliberate violation, such as breaking a Ramadan fast on purpose or breaking a sworn oath. They should not be confused.",
  },
  {
    q: "I deliberately ate during Ramadan. Do I owe kaffārah?",
    a: "Schools differ. In the Ḥanafī, Mālikī and Jaʿfarī rulings shown here, deliberately eating, drinking or intercourse requires kaffārah. In the Shāfiʿī and Ḥanbalī schools, kaffārah for a fast is only for sexual intercourse; deliberately eating or drinking requires making up the day (qaḍāʾ) and sincere repentance. In every case you also make up the broken day.",
  },
  {
    q: "Must the options be done in order?",
    a: "For a broken fast, the Ḥanafī, Shāfiʿī and Ḥanbalī schools require the order: freeing a slave, then fasting 60 consecutive days, then feeding 60 poor people. The Mālikī and Jaʿfarī schools let you choose any of the three. Some Jaʿfarī authorities require all three together if the fast was broken by a ḥarām act.",
  },
  {
    q: "What is the kaffārah for a broken oath?",
    a: "Feed ten poor people, or clothe ten poor people, or free a slave. Only if you cannot afford any of these, fast three days. This is based on Qur'an 5:89. The Ḥanafī and Ḥanbalī schools, and Ayatollah Sistani for the Jaʿfarī school, require the three days to be consecutive; the Mālikī and Shāfiʿī schools prefer it but do not require it.",
  },
  {
    q: "Why does every ruling mention freeing a slave?",
    a: "It is the first option named in the sources. It is shown for completeness, but this site marks it as historical and no longer practically applicable.",
  },
  {
    q: "If I broke more than one fast, is it one kaffārah?",
    a: "This site's Ḥanafī ruling says each day deliberately broken needs a separate kaffārah, so the calculator multiplies the feeding cost by the number of instances you enter. For a broken oath, enter the number of separate oaths broken.",
  },
  {
    q: "Is paying money enough?",
    a: "No. Kaffārah also needs sincere repentance (tawbah) and a real intention not to repeat the act. The payment or fast is the outward part; the inner part matters as much.",
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
            { name: "Kaffārah", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        hue="amber"
        eyebrow="Calculator"
        title={TITLE}
        titleAr="كَفَّارَة"
        breadcrumb="Kaffārah"
        lead="Expiation for broken obligations. Choose what happened and your school to see the required options in order, with the feeding option costed."
      />

      <KaffarahCalculator />

      <ScholarNote className="mt-8" />

      <Section id="what" title="What kaffārah is">
        <div className="prose">
          <p>
            Kaffārah literally means &ldquo;covering&rdquo;. It is a set penalty for specific acts, and it works as both
            spiritual purification and charity. The Qur&apos;an sets it for a broken oath (5:89), ẓihār (58:3 to 4)
            and accidental killing (4:92).
          </p>
          <p>
            For a deliberately broken Ramadan fast, the basis is the hadith of Abū Hurayrah in Ṣaḥīḥ al-Bukhārī 1936.
            A man told the Prophet (ﷺ) that he had had intercourse with his wife while fasting. The Prophet asked him
            in turn whether he could free a slave, then whether he could &ldquo;fast for two successive months&rdquo;,
            then whether he could &ldquo;afford to feed sixty poor persons&rdquo;.
          </p>
          <p>
            For a broken oath, Qur&apos;an 5:89 lists feeding ten needy people, clothing them, or freeing a slave, and
            fasting three days for whoever cannot do any of these.
          </p>
        </div>
      </Section>

      <Section id="how" title="How this calculator works it out">
        <div className="prose">
          <p>The calculator does two separate things.</p>
          <ul>
            <li>
              <strong>Shows the ruling.</strong> For your type and school it lists the options, says whether they must
              be tried in order, and shows the school&apos;s notes. These come straight from the site&apos;s ruling
              table.
            </li>
            <li>
              <strong>Estimates the feeding cost.</strong> It multiplies the number of people to feed (10 for a broken
              oath, 60 for every other type) by the cost of one meal you enter, then by the number of instances.
            </li>
          </ul>
          <p>
            The estimate is a guide to one option, not the whole ruling. For accidental killing, the four Sunni schools
            have no feeding option, so the calculator shows no cost there; the Jaʿfarī ruling (Sistani) allows feeding
            only if fasting is impossible. For a broken fast in the Shāfiʿī and
            Ḥanbalī schools, it only applies if the fast was broken by intercourse.
          </p>
        </div>
        <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Scrollable table">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">School</th>
                <th scope="col">Order</th>
                <th scope="col">Practical options</th>
              </tr>
            </thead>
            {optionRows.map((row) => (
              <tbody key={row.type.id}>
                {row.bySchool.map((s, i) => (
                  <tr key={s.value}>
                    {i === 0 && (
                      <th
                        scope="rowgroup"
                        rowSpan={row.bySchool.length}
                        className="!normal-case !tracking-normal !text-[14px] !text-text !font-semibold align-top border-t border-border"
                      >
                        {row.type.title}
                      </th>
                    )}
                    <td>{s.label}</td>
                    <td className="text-text-2">{s.sequential ? "In order" : "Any"}</td>
                    <td className="text-text-2">{s.practical.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Section>

      <Section id="example" title="Worked example">
        <div className="prose">
          <p>
            The meal cost below is an <strong>example only</strong> (${EX_MEAL} per meal), not a current or official
            figure. Use your own local cost in the calculator.
          </p>
          <ul>
            <li>
              <strong>One broken oath:</strong> <span className="num">{kaffarahBreakdownText(oathEstimate, EX_MEAL, 1)}</span> ={" "}
              <span className="num">{kaffarahTotalText(oathEstimate, 1)}</span>.
            </li>
            <li>
              <strong>Ḥanafī, fast deliberately broken on {EX_DAYS} days (feeding option):</strong>{" "}
              <span className="num">{kaffarahBreakdownText(fastEstimate, EX_MEAL, EX_DAYS)}</span> ={" "}
              <span className="num">{kaffarahTotalText(fastEstimate, EX_DAYS)}</span>. In the Ḥanafī school feeding is
              only allowed if fasting 60 consecutive days is not possible, and each broken day must also be made up.
            </li>
          </ul>
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
          Qur&apos;an 5:89 (broken oath):{" "}
          <a href="https://quran.com/5/89" className="lnk" rel="noopener" target="_blank">
            quran.com/5/89
          </a>
          ; 58:3 to 4 (ẓihār):{" "}
          <a href="https://quran.com/58/3-4" className="lnk" rel="noopener" target="_blank">
            quran.com/58/3-4
          </a>
          ; 4:92 (accidental killing):{" "}
          <a href="https://quran.com/4/92" className="lnk" rel="noopener" target="_blank">
            quran.com/4/92
          </a>
          .
        </p>
        <p className="mt-1">
          Ṣaḥīḥ al-Bukhārī 1936, narrated by Abū Hurayrah (Book of Fasting):{" "}
          <a href="https://sunnah.com/bukhari:1936" className="lnk" rel="noopener" target="_blank">
            sunnah.com/bukhari:1936
          </a>
          . English quotations are from the sunnah.com translation.
        </p>
        <p className="mt-1">
          School positions are summarised from this site&apos;s ruling table and scholarly notes, shown in the calculator
          above.
        </p>
      </Sources>
    </div>
  );
}

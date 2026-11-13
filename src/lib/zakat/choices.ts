// State transitions for the methodology choices, copied VERBATIM from the
// setChoices callbacks in the original /zakat page
// (tests/reference/original/pages/zakat.page.tsx.txt, lines 122-155).
import { Madhab, MethodologyChoices, MADHAB_PRESETS } from "@/lib/types";

/**
 * Original `updateChoice` updater: set one option, and switch the madhab to
 * "custom" if the result no longer matches the selected school's preset.
 */
export function applyChoice<K extends keyof MethodologyChoices>(
  prev: MethodologyChoices,
  key: K,
  value: MethodologyChoices[K]
): MethodologyChoices {
  const updated = { ...prev, [key]: value };
  // If user changes a methodology option, check if it still matches the selected preset
  if (key !== "madhab" && prev.madhab !== "custom") {
    const preset = MADHAB_PRESETS[prev.madhab as Exclude<Madhab, "custom">];
    const diverged = (Object.keys(preset) as (keyof typeof preset)[]).some(
      (k) => (k === key ? value : prev[k]) !== preset[k]
    );
    if (diverged) {
      updated.madhab = "custom";
    }
  }
  return updated;
}

/** Original `selectMadhab`: load a school's preset, or keep current options and mark them custom. */
export function applyMadhab(prev: MethodologyChoices, madhab: Madhab): MethodologyChoices {
  if (madhab === "custom") {
    return { ...prev, madhab: "custom" };
  } else {
    return { madhab, ...MADHAB_PRESETS[madhab] };
  }
}

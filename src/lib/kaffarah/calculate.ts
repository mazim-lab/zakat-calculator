// Pure kaffārah display arithmetic.
// These expressions are copied VERBATIM from the JSX of the original src/app/kaffarah/page.tsx
// (frozen copy: tests/reference/original/pages/kaffarah.page.tsx.txt, lines 232-239).
// The per-instance figure itself still comes from estimateFeedingCost in ./rulings.ts (unchanged).
// Proven equal in tests/kaffarah.test.ts. Do not change the arithmetic or the "$" strings.

/** Line 235: (feedingEstimate.totalCost * instances) */
export function kaffarahTotalCost(feedingEstimate: { people: number; totalCost: number }, instances: number): number {
  return feedingEstimate.totalCost * instances;
}

/** Line 235 rendered text: ${(feedingEstimate.totalCost * instances).toFixed(2)} */
export function kaffarahTotalText(feedingEstimate: { people: number; totalCost: number }, instances: number): string {
  return `$${(feedingEstimate.totalCost * instances).toFixed(2)}`;
}

/** Lines 238-239 rendered text: "{people} people × ${costPerMeal}/meal" plus " × {n} instances" when n > 1. */
export function kaffarahBreakdownText(
  feedingEstimate: { people: number; totalCost: number },
  costPerMeal: number,
  instances: number,
): string {
  return `${feedingEstimate.people} people × $${costPerMeal}/meal${instances > 1 ? ` × ${instances} instances` : ""}`;
}

/** Line 232 rendered text: "Estimated Cost (feeding option" plus " × {n}" when n > 1, then ")". */
export function kaffarahEstimateLabel(instances: number): string {
  return `Estimated Cost (feeding option${instances > 1 ? ` × ${instances}` : ""})`;
}

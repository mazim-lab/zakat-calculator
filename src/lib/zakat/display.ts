/**
 * Display-only tidy-up for labels and notes that come from calculate.ts.
 * Those strings use " — " as a separator; the site style avoids em dashes,
 * so the UI shows ": " instead. The underlying strings are not changed.
 */
export function tidyDash(text: string): string {
  return text.replace(/\s*—\s*/g, ": ");
}

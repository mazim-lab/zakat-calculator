/** Display helpers for result screens. Presentation only: no rounding beyond 2 decimals. */
export function money(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function count(n: number): string {
  return n.toLocaleString("en-US");
}

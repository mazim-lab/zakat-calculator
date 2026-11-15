import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { formatCurrency } from "@/lib/currency";

// Text that is rendered on the server and then hydrated in the browser must not
// depend on the runtime's default locale. The server (Cloudflare Workers) runs
// as en-US; a visitor's browser may be en-CA, fr-FR, ar-SA and so on. A
// difference throws React hydration error #418.

const RealNumberFormat = Intl.NumberFormat;

/** Make the runtime default locale behave like `locale` for Intl.NumberFormat. */
function forceDefaultLocale(locale: string) {
  const Patched = function (this: unknown, locales?: string | string[], options?: Intl.NumberFormatOptions) {
    return new RealNumberFormat(locales ?? locale, options);
  } as unknown as typeof Intl.NumberFormat;
  Object.assign(Patched, RealNumberFormat);
  Intl.NumberFormat = Patched;
}

afterEach(() => {
  Intl.NumberFormat = RealNumberFormat;
});

describe("formatCurrency is independent of the default locale", () => {
  const cases: Array<[number, string]> = [
    [124.85, "USD"],
    [20000, "USD"],
    [1234.5, "CAD"],
    [99.99, "GBP"],
  ];

  it("gives the same text under en-US, en-CA, fr-FR and ar-SA defaults", () => {
    for (const [amount, code] of cases) {
      forceDefaultLocale("en-US");
      const expected = formatCurrency(amount, code);
      for (const loc of ["en-CA", "fr-FR", "ar-SA"]) {
        forceDefaultLocale(loc);
        expect(formatCurrency(amount, code), `${amount} ${code} under ${loc}`).toBe(expected);
      }
    }
  });

  it("formats USD as $1,234.50", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });
});

describe("no default-locale formatting in rendered source", () => {
  const SRC = path.resolve(__dirname, "../src");

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.(ts|tsx)$/.test(name) ? [full] : [];
    });
  }

  // Formatting with an implicit locale: Intl.*Format(undefined, ...),
  // Intl.*Format() and .toLocaleString() / .toLocaleString(undefined, ...).
  const RISKY = /Intl\.(NumberFormat|DateTimeFormat)\(\s*(undefined\s*[,)]|\))|\.toLocale(String|DateString|TimeString)\(\s*(undefined\s*[,)]|\))/;

  // Allowed: text that is only rendered after mount (never in the server HTML).
  // PricePanel formats the price timestamp only once live prices arrive on the client.
  const ALLOW = new Set([path.join("app", "zakat", "PricePanel.tsx")]);

  it("uses an explicit locale for numbers and money", () => {
    const offenders = walk(SRC)
      .filter((f) => !ALLOW.has(path.relative(SRC, f)))
      .filter((f) => RISKY.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});

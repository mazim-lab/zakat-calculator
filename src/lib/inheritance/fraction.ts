// Display helpers for inheritance shares.
// gcd and numberToFraction are copied VERBATIM from the original
// src/app/inheritance/page.tsx (frozen copy:
// tests/reference/original/pages/inheritance.page.tsx.txt). Equality with the
// original is proven in tests/inheritance.test.ts. Do not edit the bodies.

// Simple GCD and number to fraction converter
export function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}
export function numberToFraction(num: number, tolerance = 1.e-9): string {
    if (num === 0) return "0";
    if (num === 1) return "1";

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = num;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(num - h1 / k1) > num * tolerance);

    return `${h1}/${k1}`;
}

// The original page formatted every amount inline with this exact formatter.
export function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

// The original page showed percentages inline as (share * 100).toFixed(1).
export function formatPercent(share: number): string {
    return `${(share * 100).toFixed(1)}%`;
}

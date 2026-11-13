import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-narrow py-16 sm:py-24">
      <p className="eyebrow mb-3">Error 404</p>
      <h1 className="text-[32px] sm:text-[40px] font-bold tracking-[-0.025em]">This page does not exist.</h1>
      <p className="mt-4 text-[17px] text-text-2 leading-relaxed">
        The link may be old or mistyped. Here are the calculators:
      </p>
      <ul className="mt-6 grid gap-2 list-none p-0">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`card card-link hue-${t.hue} hue-stripe block px-4 py-3 font-semibold`}>
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-ghost mt-6">
        Back to home
      </Link>
    </div>
  );
}

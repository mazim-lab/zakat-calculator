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
      <h1 className="text-[36px] sm:text-[48px] font-bold leading-tight">This page does not exist.</h1>
      <p className="mt-4 text-[19px] text-text-2 leading-relaxed">
        The link may be old or mistyped. Here are the calculators:
      </p>
      <ul className="mt-6 grid gap-3 list-none p-0">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`card card-link hue-${t.hue} flex items-center gap-3 px-5 py-4 min-h-[56px] font-bold text-[18px]`}>
              <span className="hue-star" aria-hidden="true" />
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

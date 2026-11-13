// Server-safe presentational components shared by every page.
import Link from "next/link";
import type { ReactNode } from "react";
import { TOOLS, type Hue } from "@/lib/site";
import type { FaqItem } from "@/lib/seo";
import { faqJsonLd } from "@/lib/seo";

/** Inline JSON-LD block. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to prevent breaking out of the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Arabic text, correctly isolated and right-to-left. */
export function Ar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span lang="ar" dir="rtl" className={`ar ${className}`}>
      {children}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-2">
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-text-3">/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-text underline-offset-4 hover:underline">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-text">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Page hero used by every tool and content page. */
export function PageIntro({
  hue = "neutral",
  eyebrow,
  title,
  titleAr,
  lead,
  children,
  breadcrumb,
}: {
  hue?: Hue;
  eyebrow?: string;
  title: string;
  titleAr?: string;
  lead?: ReactNode;
  children?: ReactNode;
  breadcrumb?: string;
}) {
  return (
    <header className={`hue-${hue} pt-8 pb-6 sm:pt-12 sm:pb-8`}>
      {breadcrumb && (
        <div className="mb-5">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: breadcrumb }]} />
        </div>
      )}
      {eyebrow && (
        <p className="eyebrow flex items-center gap-2 mb-3">
          <span className="hue-dot" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h1 className="text-[30px] sm:text-[40px] font-bold tracking-[-0.025em] leading-[1.15] flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span>{title}</span>
        {titleAr && <Ar className="text-[28px] sm:text-[34px] font-normal text-text-2">{titleAr}</Ar>}
      </h1>
      {lead && <p className="mt-4 text-[17px] sm:text-lg text-text-2 max-w-[62ch] leading-relaxed">{lead}</p>}
      {children}
    </header>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: "info" | "warning" | "success" | "danger" | "neutral";
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const toneClass = tone === "neutral" ? "" : `callout-${tone}`;
  return (
    <div className={`callout ${toneClass} ${className}`}>
      {title && <p className="font-semibold text-text mb-1">{title}</p>}
      <div className="text-text-2 leading-relaxed">{children}</div>
    </div>
  );
}

/** Standard "not a fatwa" note shown with every calculator. */
export function ScholarNote({ className = "" }: { className?: string }) {
  return (
    <Callout tone="neutral" title="A tool, not a fatwa" className={className}>
      This calculator is for education and reference. It is not a substitute for a qualified scholar
      of your school, or for a lawyer, accountant or tax adviser where local law applies. For your
      personal situation, please confirm the result with someone qualified.
    </Callout>
  );
}

/** Content section with an anchor id and an h2. */
export function Section({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`py-8 sm:py-10 border-t border-border ${className}`}>
      <h2 id={`${id}-h`} className="text-[24px] sm:text-[26px] font-[650] mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** FAQ list as native disclosures, plus FAQPage JSON-LD. */
export function Faq({ items, withJsonLd = true }: { items: (FaqItem & { body?: ReactNode })[]; withJsonLd?: boolean }) {
  return (
    <div>
      {items.map((it, i) => (
        <details key={i} className="disclosure">
          <summary>{it.q}</summary>
          <div className="disclosure-body prose text-[15.5px]">{it.body ?? <p>{it.a}</p>}</div>
        </details>
      ))}
      {withJsonLd && <JsonLd data={faqJsonLd(items.map(({ q, a }) => ({ q, a })))} />}
    </div>
  );
}

/** On-page table of contents for long content. */
export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="panel">
      <p className="eyebrow mb-2">On this page</p>
      <ol className="m-0 ps-5 space-y-1 text-[15px]">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-text-2 hover:text-text underline-offset-4 hover:underline">
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Links to the other calculators. */
export function RelatedTools({ current }: { current?: string }) {
  const tools = TOOLS.filter((t) => t.href !== current);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {tools.map((t) => (
        <Link key={t.href} href={t.href} className={`card card-link hue-${t.hue} hue-stripe p-4`}>
          <span className="flex items-center gap-2 font-semibold text-text">
            {t.title} <Ar className="text-text-2 font-normal">{t.titleAr}</Ar>
          </span>
          <span className="block text-sm text-text-2 mt-1 leading-relaxed">{t.summary}</span>
        </Link>
      ))}
    </div>
  );
}

/** Source citation line used under explanatory content. */
export function Sources({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 text-[13.5px] text-text-2 leading-relaxed">
      <p className="eyebrow mb-1">Sources</p>
      {children}
    </div>
  );
}

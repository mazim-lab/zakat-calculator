"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_FINDER } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0" aria-label="Islamic Ḥisāb home">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="6.5" fill="var(--mark-bg)" />
        <circle cx="9" cy="14" r="2.6" fill="var(--mark-1)" />
        <circle cx="14" cy="14" r="2.6" fill="var(--mark-2)" />
        <circle cx="19" cy="14" r="2.6" fill="var(--mark-3)" />
      </svg>
      <span className="text-[17px] font-bold tracking-[-0.02em] text-text whitespace-nowrap">Islamic Ḥisāb</span>
      <span lang="ar" dir="rtl" className="ar text-[17px] text-text-2 hidden sm:inline" aria-hidden="true">
        حساب
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [...NAV, { href: SCHOOL_FINDER.href, label: "Find your school" }];
  const isActive = (href: string) => pathname === href;

  return (
    <header className="site-header">
      <div className="topbar" aria-hidden="true" />
      <div className="container flex items-center justify-between gap-3 h-14">
        <Logo />
        <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="lg:hidden btn btn-ghost !min-h-[40px] !px-3"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div id="mobile-menu" hidden={!open} className="lg:hidden border-t border-border bg-surface">
        <nav aria-label="Main (mobile)" className="container py-2 grid">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link !justify-start !text-base !min-h-[44px]"
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/glossary" className="nav-link !text-base !min-h-[44px]" aria-current={isActive("/glossary") ? "page" : undefined}>
            Glossary
          </Link>
          <Link href="/about" className="nav-link !text-base !min-h-[44px]" aria-current={isActive("/about") ? "page" : undefined}>
            About &amp; methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}

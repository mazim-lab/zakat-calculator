"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SCHOOL_FINDER } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { StarMark } from "./ornament";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0 min-h-[44px]" aria-label="Islamic Ḥisāb home">
      <StarMark size={34} />
      <span className="wordmark">Islamic Ḥisāb</span>
      <span lang="ar" dir="rtl" className="wordmark-ar hidden sm:inline" aria-hidden="true">
        حساب
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape (links close it on click).
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
      <div className="container flex items-center justify-between gap-3 h-[68px]">
        <Logo />
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
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
            className="lg:hidden btn btn-ghost !min-h-[44px] !w-11 !px-0"
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
        <nav aria-label="Main (mobile)" className="container py-3 grid gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link !justify-start !text-[18px] !min-h-[48px]"
              aria-current={isActive(l.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/glossary" onClick={() => setOpen(false)} className="nav-link !text-[18px] !min-h-[48px]" aria-current={isActive("/glossary") ? "page" : undefined}>
            Glossary
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="nav-link !text-[18px] !min-h-[48px]" aria-current={isActive("/about") ? "page" : undefined}>
            About &amp; methodology
          </Link>
        </nav>
      </div>
    </header>
  );
}

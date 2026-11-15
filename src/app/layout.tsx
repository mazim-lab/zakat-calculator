import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Alegreya, Alegreya_Sans, Amiri } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { themeInitScript } from "@/components/ThemeToggle";
import { JsonLd, Ar } from "@/components/ui";
import { StarMark } from "@/components/ornament";
import { SITE, TOOLS, SCHOOL_FINDER, REFERENCE_PAGES } from "@/lib/site";
import "./globals.css";

// Alegreya (text) and Alegreya Sans (controls): Juan Pablo del Peral / Huerta Tipografica, SIL OFL 1.1.
// Amiri (Arabic): Khaled Hosny, after the Bulaq Press Naskh, SIL OFL 1.1.
const alegreya = Alegreya({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-alegreya",
  display: "swap",
});
const alegreyaSans = Alegreya_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-alegreya-sans",
  display: "swap",
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-amiri",
  display: "swap",
});

// Vercel Web Analytics and Speed Insights only work on Vercel. Cloudflare
// Workers Builds sets WORKERS_CI=1 during its build, so a Cloudflare build
// leaves both out instead of requesting /_vercel/ scripts that do not exist
// there. Vercel never sets WORKERS_CI, so the Vercel site is unchanged.
const BUILT_ON_CLOUDFLARE = process.env.WORKERS_CI === "1";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: Islamic calculators for Zakat, inheritance and more`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Ḥisāb", statusBarStyle: "default" },
  icons: { icon: "/favicon.ico", apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${alegreya.variable} ${alegreyaSans.variable} ${amiri.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            alternateName: [SITE.nameAscii, SITE.nameAr],
            url: SITE.url + "/",
            description: SITE.description,
            inLanguage: "en",
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <ServiceWorkerRegister />
        {!BUILT_ON_CLOUDFLARE && <Analytics />}
        {!BUILT_ON_CLOUDFLARE && <SpeedInsights />}
      </body>
    </html>
  );
}

function SiteFooter() {
  const linkCls = "text-text-2 hover:text-indigo-text underline-offset-4 hover:underline inline-flex min-h-[44px] items-center";
  return (
    <footer className="site-footer mt-20">
      <div className="lattice h-10 border-t-[3px] border-double border-border-strong" aria-hidden="true" />
      <div className="bg-surface-2/70">
        <div className="container py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-3">
              <StarMark size={30} />
              <span className="wordmark">{SITE.name}</span>
              <Ar className="wordmark-ar">{SITE.nameAr}</Ar>
            </p>
            <p className="mt-4 text-[16.5px] text-text-2 leading-relaxed max-w-[44ch]">
              These tools are for education and reference. For personal rulings, always consult a qualified scholar of
              your school of jurisprudence.
            </p>
          </div>
          <nav aria-label="Calculators">
            <p className="eyebrow mb-2">Calculators</p>
            <ul className="list-none p-0 m-0 grid text-[16.5px] ui">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className={linkCls}>
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Reference">
            <p className="eyebrow mb-2">Reference</p>
            <ul className="list-none p-0 m-0 grid text-[16.5px] ui">
              <li>
                <Link href={SCHOOL_FINDER.href} className={linkCls}>
                  Find your school
                </Link>
              </li>
              {REFERENCE_PAGES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className={linkCls}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="container pb-10 flex flex-wrap items-center justify-between gap-2 text-[15px] text-text-2 ui">
          <span>islamichisab.com</span>
          <a href="https://saleel.ca" target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] hover:text-indigo-text hover:underline underline-offset-4">
            Created by Saleel
          </a>
        </div>
      </div>
    </footer>
  );
}

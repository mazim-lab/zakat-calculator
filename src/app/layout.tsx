import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter, IBM_Plex_Mono, Noto_Naskh_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/SiteHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { themeInitScript } from "@/components/ThemeToggle";
import { JsonLd, Ar } from "@/components/ui";
import { SITE, TOOLS, SCHOOL_FINDER, REFERENCE_PAGES } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-naskh",
  display: "swap",
});

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
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${inter.variable} ${plexMono.variable} ${naskh.variable}`}>
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer mt-16 border-t border-border bg-surface-2/60">
      <div className="container py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-bold text-text">
            {SITE.name} <Ar className="font-normal text-text-2 ms-1">{SITE.nameAr}</Ar>
          </p>
          <p className="mt-2 text-sm text-text-2 leading-relaxed max-w-[46ch]">
            These tools are for education and reference. For personal rulings, always consult a qualified scholar of
            your school of jurisprudence.
          </p>
        </div>
        <nav aria-label="Calculators">
          <p className="eyebrow mb-2">Calculators</p>
          <ul className="list-none p-0 m-0 space-y-1.5 text-sm">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="text-text-2 hover:text-text hover:underline underline-offset-4">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Reference">
          <p className="eyebrow mb-2">Reference</p>
          <ul className="list-none p-0 m-0 space-y-1.5 text-sm">
            <li>
              <Link href={SCHOOL_FINDER.href} className="text-text-2 hover:text-text hover:underline underline-offset-4">
                Find your school
              </Link>
            </li>
            {REFERENCE_PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="text-text-2 hover:text-text hover:underline underline-offset-4">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container pb-8 flex flex-wrap items-center justify-between gap-2 text-xs text-text-2">
        <span>islamichisab.com</span>
        <a href="https://saleel.ca" target="_blank" rel="noopener noreferrer" className="hover:text-text hover:underline underline-offset-4">
          Created by Saleel
        </a>
      </div>
    </footer>
  );
}

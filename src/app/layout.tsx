import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Islamic Ḥisāb — islamichisab.com",
  description:
    "A comprehensive suite of Islamic calculators: Zakat, Zakat al-Fitr, Inheritance (Mīrāth), Fidya, Kaffārah, and more. Multi-school support across all major schools of Islamic jurisprudence.",
  metadataBase: new URL("https://islamichisab.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--cream)]/90 backdrop-blur-md border-b border-[var(--sand)]">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <span className="font-['Noto_Naskh_Arabic',serif] text-xl text-[var(--gold-dark)]">
                حساب
              </span>
              <span className="font-['Amiri',serif] font-bold text-lg text-[var(--ink)]">
                Islamic Ḥisāb
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium text-[var(--ink-muted)]">
              <Link href="/zakat" className="hover:text-[var(--emerald)] transition-colors no-underline">
                Zakat
              </Link>
              <Link href="/zakat-fitr" className="hover:text-[var(--emerald)] transition-colors no-underline">
                Fiṭr
              </Link>
              <Link href="/fidya" className="hover:text-[var(--emerald)] transition-colors no-underline">
                Fidya
              </Link>
              <Link href="/kaffarah" className="hover:text-[var(--emerald)] transition-colors no-underline">
                Kaffārah
              </Link>
              <Link href="/inheritance" className="hover:text-[var(--emerald)] transition-colors no-underline">
                Inheritance
              </Link>
              <Link href="/find-your-school" className="hover:text-[var(--gold-dark)] transition-colors no-underline text-[var(--gold)]">
                🧭
              </Link>
            </div>
          </div>
        </nav>
        <div className="pt-14">
          {children}
          <footer className="relative z-10 pb-6 pr-6 text-right">
            <a
              href="https://saleel.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--ink-faint)] hover:text-[var(--gold-dark)] transition-colors no-underline"
            >
              Created by Saleel
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}

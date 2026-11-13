"use client";

import { useCallback, useRef } from "react";

// Machine translation via Google Translate, loaded only when a reader picks a
// language (no third-party script on first load). Right-to-left languages also
// flip the document direction so layout, alignment and numbers read correctly.

const LANGUAGES: { code: string; label: string; rtl?: boolean }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية", rtl: true },
  { code: "ur", label: "اردو", rtl: true },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "fr", label: "Français" },
  { code: "tr", label: "Türkçe" },
  { code: "bn", label: "বাংলা" },
  { code: "fa", label: "فارسی", rtl: true },
  { code: "sw", label: "Kiswahili" },
  { code: "ha", label: "Hausa" },
  { code: "so", label: "Soomaali" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh-CN", label: "中文" },
  { code: "ru", label: "Русский" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export function LanguageSwitcher() {
  const gtLoaded = useRef(false);

  const loadGoogleTranslate = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (gtLoaded.current && (window as any).google?.translate) {
        resolve();
        return;
      }
      let el = document.getElementById("google_translate_element");
      if (!el) {
        el = document.createElement("div");
        el.id = "google_translate_element";
        el.style.position = "absolute";
        el.style.top = "-9999px";
        el.style.left = "-9999px";
        document.body.appendChild(el);
      }
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES.filter((l) => l.code !== "en").map((l) => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element"
        );
        gtLoaded.current = true;
        resolve();
      };
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
      } else {
        const check = setInterval(() => {
          if ((window as any).google?.translate) {
            clearInterval(check);
            (window as any).googleTranslateElementInit();
          }
        }, 100);
        setTimeout(() => clearInterval(check), 5000);
      }
    });
  }, []);

  const handleChange = async (lang: string) => {
    if (lang === "en") {
      document
        .querySelectorAll(
          'script[src*="translate.google.com"], .skiptranslate, #goog-gt-tt, .goog-te-banner-frame, .goog-te-spinner-pos, #google_translate_element'
        )
        .forEach((el) => el.remove());
      delete (window as any).google;
      delete (window as any).googleTranslateElementInit;
      gtLoaded.current = false;
      const d = window.location.hostname;
      [d, "." + d, ""].forEach((domain) => {
        const dm = domain ? `; domain=${domain}` : "";
        document.cookie = `googtrans=;path=/${dm};expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      });
      try {
        sessionStorage.setItem("noTranslate", "1");
      } catch {}
      window.location.reload();
      return;
    }
    try {
      sessionStorage.removeItem("noTranslate");
    } catch {}

    const info = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = info?.rtl ? "rtl" : "ltr";

    await loadGoogleTranslate();
    const combo = await new Promise<HTMLSelectElement | null>((resolve) => {
      let attempts = 0;
      const check = setInterval(() => {
        const c = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (c) {
          clearInterval(check);
          resolve(c);
        }
        if (++attempts > 30) {
          clearInterval(check);
          resolve(null);
        }
      }, 100);
    });
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div className="relative notranslate" translate="no">
      <label htmlFor="lang-select" className="sr-only">
        Translate this page (machine translation)
      </label>
      <svg
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-2.5 text-text-3"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <select
        id="lang-select"
        defaultValue="en"
        onChange={(e) => handleChange(e.target.value)}
        className="!min-h-[40px] !w-[96px] sm:!w-[150px] !py-1.5 !ps-8 !text-[14px] text-text-2"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

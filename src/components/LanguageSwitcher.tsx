"use client";

import { useRef, useCallback } from "react";

export function LanguageSwitcher() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const gtLoaded = useRef(false);

  const loadGoogleTranslate = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (gtLoaded.current && (window as any).google?.translate) {
        resolve();
        return;
      }

      // Create the hidden container
      let el = document.getElementById("google_translate_element");
      if (!el) {
        el = document.createElement("div");
        el.id = "google_translate_element";
        el.style.position = "absolute";
        el.style.top = "-9999px";
        el.style.left = "-9999px";
        document.body.appendChild(el);
      }

      // Set up init callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ar,ur,id,ms,fr,tr,bn,fa,sw,ha,so,de,es,hi,zh-CN,ru",
            autoDisplay: false,
          },
          "google_translate_element"
        );
        gtLoaded.current = true;
        resolve();
      };

      // Load the script
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.head.appendChild(script);
      } else {
        // Script exists but maybe hasn't fired yet
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
      // Remove Google Translate entirely: remove script, iframe, elements, cookies
      // Remove all GT-related DOM
      document.querySelectorAll(
        'script[src*="translate.google.com"], .skiptranslate, #goog-gt-tt, .goog-te-banner-frame, .goog-te-spinner-pos, #google_translate_element'
      ).forEach((el) => el.remove());

      // Clean up global state
      delete (window as any).google;
      delete (window as any).googleTranslateElementInit;
      gtLoaded.current = false;

      // Clear cookies
      const d = window.location.hostname;
      [d, "." + d, ""].forEach((domain) => {
        const dm = domain ? `; domain=${domain}` : "";
        document.cookie = `googtrans=;path=/${dm};expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      });

      // Restore the page — GT modifies text nodes in place, so we need a reload
      // But we need to prevent GT from re-initializing on reload
      // Set a flag in sessionStorage
      sessionStorage.setItem("noTranslate", "1");
      window.location.reload();
      return;
    }

    // Remove the no-translate flag if set
    sessionStorage.removeItem("noTranslate");

    // Load GT on demand and translate
    await loadGoogleTranslate();

    // Wait a bit for the combo to appear
    const waitForCombo = () =>
      new Promise<HTMLSelectElement | null>((resolve) => {
        let attempts = 0;
        const check = setInterval(() => {
          const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
          if (combo) {
            clearInterval(check);
            resolve(combo);
          }
          if (++attempts > 30) {
            clearInterval(check);
            resolve(null);
          }
        }, 100);
      });

    const combo = await waitForCombo();
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    }
  };

  return (
    <select
      ref={selectRef}
      aria-label="Translate page"
      className="translate-select"
      defaultValue="en"
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="en">🌐 English</option>
      <option value="ar">العربية</option>
      <option value="ur">اردو</option>
      <option value="id">Bahasa Indonesia</option>
      <option value="ms">Bahasa Melayu</option>
      <option value="fr">Français</option>
      <option value="tr">Türkçe</option>
      <option value="bn">বাংলা</option>
      <option value="fa">فارسی</option>
      <option value="sw">Kiswahili</option>
      <option value="ha">Hausa</option>
      <option value="so">Soomaali</option>
      <option value="es">Español</option>
      <option value="de">Deutsch</option>
      <option value="hi">हिन्दी</option>
      <option value="zh-CN">中文</option>
      <option value="ru">Русский</option>
    </select>
  );
}

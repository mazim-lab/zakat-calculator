"use client";

import { useEffect, useRef } from "react";

export function LanguageSwitcher() {
  const selectRef = useRef<HTMLSelectElement>(null);

  // On mount, sync our dropdown with any active translation
  useEffect(() => {
    const checkCookie = () => {
      const match = document.cookie.match(/googtrans=\/en\/([a-z-]+)/i);
      if (match && selectRef.current) {
        selectRef.current.value = match[1];
      }
    };
    // Check after Google Translate initializes
    const timer = setTimeout(checkCookie, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (lang: string) => {
    if (lang === "") {
      // Revert to English: nuke all googtrans cookies and do a clean reload
      const hostname = window.location.hostname;
      const paths = ["/"];
      const domains = ["", hostname, "." + hostname];
      for (const p of paths) {
        for (const d of domains) {
          const dm = d ? `; domain=${d}` : "";
          document.cookie = `googtrans=; path=${p}${dm}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
          document.cookie = `googtrans=; path=${p}${dm}; max-age=0`;
        }
      }
      // Force a hard reload bypassing cache
      window.location.href = window.location.pathname;
      return;
    }

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event("change"));
    }
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <select
        ref={selectRef}
        aria-label="Translate page"
        className="translate-select"
        defaultValue=""
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">🌐 English</option>
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
    </>
  );
}

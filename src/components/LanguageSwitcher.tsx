"use client";

import { useEffect, useRef } from "react";

export function LanguageSwitcher() {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    // Initialize Google Translate once the component mounts
    const initGT = () => {
      if (typeof window !== "undefined" && (window as any).google?.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "ar,ur,id,ms,fr,tr,bn,fa,sw,ha,so,de,es,hi,zh-CN,ru",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Check if the script is already loaded
    if ((window as any).google?.translate) {
      initGT();
    } else {
      // Set the callback for when the script loads
      (window as any).googleTranslateElementInit = initGT;
    }

    // Sync dropdown with active cookie
    const timer = setTimeout(() => {
      const match = document.cookie.match(/googtrans=\/en\/([a-z-]+)/i);
      if (match && selectRef.current) {
        selectRef.current.value = match[1];
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (lang: string) => {
    if (lang === "") {
      // Revert to English: use Google's own restore mechanism
      // The most reliable way is to set the cookie to /en/en and reload
      const hostname = window.location.hostname;
      const cookieStr = "googtrans=/en/en; path=/";
      document.cookie = cookieStr;
      document.cookie = cookieStr + "; domain=" + hostname;
      document.cookie = cookieStr + "; domain=." + hostname;
      // Also try clearing it entirely
      const clearStr = "googtrans=; path=/; max-age=0";
      document.cookie = clearStr;
      document.cookie = clearStr + "; domain=" + hostname;
      document.cookie = clearStr + "; domain=." + hostname;
      // Hard reload with cache bust
      window.location.href = window.location.pathname + "?_=" + Date.now();
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
      <div
        id="google_translate_element"
        style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
      />
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

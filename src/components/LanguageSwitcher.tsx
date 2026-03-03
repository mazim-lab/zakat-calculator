"use client";

export function LanguageSwitcher() {
  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <select
        id="lang-switcher"
        aria-label="Translate page"
        className="translate-select"
        defaultValue=""
        onChange={(e) => {
          const combo = document.querySelector<HTMLSelectElement>(
            ".goog-te-combo"
          );
          if (e.target.value === "") {
            // Revert to English
            if (combo) {
              combo.value = "en";
              combo.dispatchEvent(new Event("change"));
              // Give Google Translate a moment to process, then clean up
              setTimeout(() => {
                const hostname = window.location.hostname;
                ["", hostname, "." + hostname].forEach((d) => {
                  const dm = d ? "; domain=" + d : "";
                  document.cookie = "googtrans=; path=/" + dm + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                });
                window.location.reload();
              }, 500);
            } else {
              // Combo not loaded yet — just clear cookies and reload
              const hostname = window.location.hostname;
              ["", hostname, "." + hostname].forEach((d) => {
                const dm = d ? "; domain=" + d : "";
                document.cookie = "googtrans=; path=/" + dm + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
              });
              window.location.reload();
            }
            return;
          }
          if (combo) {
            combo.value = e.target.value;
            combo.dispatchEvent(new Event("change"));
          }
        }}
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

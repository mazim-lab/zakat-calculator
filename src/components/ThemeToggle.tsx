"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "ih-theme";
const ORDER: Mode[] = ["system", "light", "dark"];
const LABEL: Record<Mode, string> = { system: "System theme", light: "Light theme", dark: "Dark theme" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.themeMode = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0d0f16" : "#ffffff");
}

/** Three-way theme toggle (system / light / dark), as on FAEConf. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    let saved: Mode = "system";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark" || v === "system") saved = v;
    } catch {}
    setMode(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let cur: string | null = null;
      try {
        cur = localStorage.getItem(KEY);
      } catch {}
      if (!cur || cur === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];

  return (
    <button
      type="button"
      className="btn btn-ghost !min-h-[40px] !w-10 !p-0"
      onClick={() => {
        setMode(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {}
        apply(next);
      }}
      aria-label={`${LABEL[mode]}. Switch to ${LABEL[next].toLowerCase()}`}
      title={LABEL[mode]}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {mode === "light" && (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
        {mode === "dark" && <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
        {mode === "system" && (
          <>
            <rect x="2" y="4" width="20" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </>
        )}
      </svg>
    </button>
  );
}

/** Inline, render-blocking script that sets the theme before first paint (no flash). */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${KEY}')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.dataset.themeMode=m;var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute('content',d?'#0d0f16':'#ffffff');}catch(e){}})();`;

"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark" | "system";
const KEY = "ih-theme";
const ORDER: Mode[] = ["system", "light", "dark"];
const LABEL: Record<Mode, string> = { system: "Auto theme (follows your device)", light: "Day theme", dark: "Night theme" };

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.themeMode = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0d0f16" : "#ffffff");
}

// The current mode lives on <html data-theme-mode> (set before paint by themeInitScript).
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onOs = () => {
    if ((document.documentElement.dataset.themeMode || "system") === "system") apply("system");
  };
  mq.addEventListener("change", onOs);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onOs);
  };
}
function getSnapshot(): Mode {
  const m = document.documentElement.dataset.themeMode;
  return m === "light" || m === "dark" ? m : "system";
}

const WORD: Record<Mode, string> = { system: "Auto", light: "Day", dark: "Night" };

/** Theme control: a pill that cycles Auto, Day and Night. Day is an eight-ray sun, Night a restrained crescent. */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => "system" as Mode);

  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];

  return (
    <button
      type="button"
      className="theme-pill"
      onClick={() => {
        try {
          localStorage.setItem(KEY, next);
        } catch {}
        apply(next);
        listeners.forEach((l) => l());
      }}
      aria-label={`${LABEL[mode]}. Switch to ${LABEL[next].toLowerCase()}`}
      title={LABEL[mode]}
    >
      <span className="theme-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {mode === "light" && (
            <>
              <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
              <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
            </>
          )}
          {mode === "dark" && <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" fill="currentColor" stroke="none" />}
          {mode === "system" && (
            <>
              <circle cx="12" cy="12" r="8" />
              <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
            </>
          )}
        </svg>
      </span>
      <span className="theme-word" aria-hidden="true">
        {WORD[mode]}
      </span>
    </button>
  );
}

/** Inline, render-blocking script that sets the theme before first paint (no flash). */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${KEY}')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.dataset.themeMode=m;var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute('content',d?'#0d0f16':'#ffffff');}catch(e){}})();`;

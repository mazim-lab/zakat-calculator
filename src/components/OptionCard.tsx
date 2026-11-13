"use client";

import { useId, useState } from "react";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

/** Arabic-script strings get lang="ar", dir="rtl" and the Naskh font (via [lang="ar"] in globals.css). */
function arabicProps(text: string): { lang?: string; dir?: "rtl" } {
  return /^[\s؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿/()]+$/.test(text) ? { lang: "ar", dir: "rtl" } : {};
}

/** A selectable choice. Rendered as a toggle button (aria-pressed) with an optional "more info" disclosure. */
export function OptionCard({ selected, onClick, title, subtitle, description, badge, children }: OptionCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const infoId = useId();

  return (
    <div>
      <div className="relative">
        <button type="button" className="option" aria-pressed={selected} onClick={onClick}>
          <span className="option-radio" aria-hidden="true" />
          <span className={`flex-1 min-w-0 ${description ? "pe-11" : ""}`}>
            <span className="block font-bold text-[17.5px] text-text leading-snug">{title}</span>
            {badge && (
              <span className="chip chip-amber mt-2 !whitespace-normal">
                <span {...arabicProps(badge)}>{badge}</span>
              </span>
            )}
            {subtitle && (
              <span className="block text-[16px] text-text-2 mt-1 leading-snug">
                <span {...arabicProps(subtitle)}>{subtitle}</span>
              </span>
            )}
          </span>
        </button>
        {description && (
          <button
            type="button"
            onClick={() => setShowInfo((s) => !s)}
            className="absolute top-2 end-2 w-11 h-11 rounded-full grid place-items-center text-text-2 hover:text-indigo-text hover:bg-surface-2 cursor-pointer"
            aria-expanded={showInfo}
            aria-controls={infoId}
            aria-label={`More about: ${title}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {description && (
        <div id={infoId} hidden={!showInfo} className="fade-in mx-1 mt-2 mb-1 panel !py-3 text-[16px] text-text-2 leading-relaxed ui">
          {description}
        </div>
      )}
      {children && <div className="mt-2 ms-9">{children}</div>}
    </div>
  );
}

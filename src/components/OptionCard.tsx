"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  description,
  badge,
  children,
}: OptionCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-2 ${
          selected
            ? "border-[var(--emerald)] bg-[var(--info-bg)] shadow-[0_0_0_3px_rgba(26,107,74,0.1)]"
            : "border-[var(--sand)] bg-[var(--cream-light)] hover:border-[var(--sand-dark)]"
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={onClick}
          className="flex-1 text-left cursor-pointer bg-transparent border-none p-0"
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                selected
                  ? "border-[var(--emerald)] bg-[var(--emerald)]"
                  : "border-[var(--sand-dark)]"
              }`}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </div>
            <div>
              <h3 className="font-['Amiri',serif] font-bold text-lg text-[var(--ink)]">
                {title}
              </h3>
              {badge && (
                <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--gold-dark)] text-xs font-semibold rounded-full">
                  {badge}
                </span>
              )}
              {subtitle && (
                <p className="text-[var(--emerald-muted)] font-medium text-sm mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </motion.button>

        {description && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
            }}
            className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm cursor-pointer border transition-all ${
              showInfo
                ? "bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold-dark)]"
                : "bg-[var(--sand)]/30 border-[var(--sand)] text-[var(--ink-faint)] hover:border-[var(--gold)] hover:text-[var(--gold-dark)]"
            }`}
            aria-label="More info"
          >
            ℹ
          </button>
        )}
      </div>

      <AnimatePresence>
        {showInfo && description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-2 mt-1 mb-1 p-3 rounded-xl bg-[var(--parchment)] border-l-3 border-[var(--gold)] text-sm text-[var(--ink-muted)] leading-relaxed"
                 style={{ borderLeftWidth: "3px", borderLeftColor: "var(--gold)" }}>
              {description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children && (
        <div className="mt-1 ml-7">{children}</div>
      )}
    </div>
  );
}

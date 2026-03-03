"use client";

import { motion } from "framer-motion";

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
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        selected
          ? "border-[var(--emerald)] bg-[var(--info-bg)] shadow-[0_0_0_3px_rgba(26,107,74,0.1)]"
          : "border-[var(--sand)] bg-[var(--cream-light)] hover:border-[var(--sand-dark)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
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
            <h3 className="font-['Amiri',serif] font-bold text-lg text-[var(--ink)]">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[var(--emerald-muted)] font-medium text-sm mt-1 ml-7">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-[var(--ink-muted)] text-sm leading-relaxed mt-2 ml-7">
              {description}
            </p>
          )}
          {children && <div className="mt-2 ml-7">{children}</div>}
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--gold-dark)] text-xs font-semibold rounded-full whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
    </motion.button>
  );
}

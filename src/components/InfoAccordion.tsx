"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoPanel } from "@/lib/scholarly-info";

export function InfoAccordion({ info }: { info: InfoPanel }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[var(--emerald)] hover:text-[var(--emerald-deep)] transition-colors text-base font-medium cursor-pointer"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-['Amiri',serif]">What do the scholars say?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="info-panel mt-3">
              <h4 className="font-['Amiri',serif] font-bold text-lg text-[var(--emerald-deep)] mb-1">
                {info.title}
              </h4>
              <p className="text-[var(--ink-muted)] text-sm leading-relaxed mb-4">
                {info.description}
              </p>

              <div className="space-y-3">
                {info.positions.map((pos, i) => (
                  <div key={i} className="bg-white/60 rounded-xl p-3.5">
                    <div className="flex items-start gap-2">
                      <span className="star-ornament mt-0.5 text-sm">✦</span>
                      <div>
                        <p className="font-semibold text-[var(--ink)] text-sm">
                          {pos.school}
                        </p>
                        <p className="text-[var(--emerald-deep)] font-medium text-sm mt-0.5">
                          {pos.position}
                        </p>
                        <p className="text-[var(--ink-muted)] text-xs leading-relaxed mt-1">
                          {pos.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {info.note && (
                <div className="mt-3 pt-3 border-t border-[var(--info-border)]">
                  <p className="text-xs text-[var(--ink-faint)] italic leading-relaxed">
                    📝 {info.note}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

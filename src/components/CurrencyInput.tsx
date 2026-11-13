"use client";

import { useId } from "react";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

/**
 * Numeric input with a label, optional prefix/suffix and hint.
 * Parsing is unchanged from the original: parseFloat(value) || 0, and 0 renders as empty.
 */
export function CurrencyInput({ label, value, onChange, placeholder = "0", prefix = "$", suffix, hint }: CurrencyInputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const padStart = prefix ? `${Math.max(2, prefix.length * 0.65 + 1.2)}rem` : undefined;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-3 mono text-[15px]" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          style={{ paddingInlineStart: padStart, paddingInlineEnd: suffix ? "4.5rem" : undefined }}
        />
        {suffix && (
          <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-3 text-sm" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

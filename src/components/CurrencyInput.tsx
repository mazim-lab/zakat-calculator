"use client";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  prefix = "$",
  suffix,
  hint,
}: CurrencyInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-base font-medium text-[var(--ink-light)]">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] text-lg font-medium">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          className={prefix ? "!pl-8" : ""}
          style={prefix ? { paddingLeft: "2rem" } : {}}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] text-sm">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-[var(--ink-faint)] leading-relaxed mt-1">{hint}</p>
      )}
    </div>
  );
}

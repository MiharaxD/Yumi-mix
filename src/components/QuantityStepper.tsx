"use client";

import { IconeMais, IconeMenos } from "@/components/Icones";

export function QuantityStepper({
  value,
  onChange,
  max,
  label,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  label: string;
  size?: "sm" | "md";
}) {
  const btn = `grid ${size === "sm" ? "size-9" : "size-11"} place-items-center rounded-full transition-colors hover:bg-nevoa disabled:opacity-30 disabled:hover:bg-transparent`;
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full bg-branco p-0.5 shadow-[inset_0_0_0_1.5px_rgb(23_24_28/0.12)]"
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Diminuir quantidade">
        <IconeMenos className="size-4" />
      </button>
      <output className={`text-center font-semibold ${size === "sm" ? "w-7 text-sm" : "w-9"}`} aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <IconeMais className="size-4" />
      </button>
    </div>
  );
}

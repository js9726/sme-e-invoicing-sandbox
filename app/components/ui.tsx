import type { ReactNode } from "react";
import type { ValidationItem } from "../../lib/types";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-[#d7ddd7] bg-[#f8faf8] p-3">
      <p className="text-xs font-semibold uppercase text-[#61716a]">{label}</p>
      <p className={strong ? "mt-1 text-xl font-semibold text-[#0f5f4d]" : "mt-1 text-lg font-semibold"}>
        {value}
      </p>
    </div>
  );
}

export function scoreClass(score: number) {
  if (score >= 90) {
    return "rounded-md bg-[#dff4e7] px-2 py-1 text-sm font-semibold text-[#15623f]";
  }
  if (score >= 75) {
    return "rounded-md bg-[#fff1ca] px-2 py-1 text-sm font-semibold text-[#795808]";
  }
  return "rounded-md bg-[#ffe1df] px-2 py-1 text-sm font-semibold text-[#8b2d28]";
}

export function statusClass(status: ValidationItem["status"]) {
  if (status === "pass") {
    return "rounded-md bg-[#dff4e7] px-2 py-1 text-xs font-semibold uppercase text-[#15623f]";
  }
  if (status === "warn") {
    return "rounded-md bg-[#fff1ca] px-2 py-1 text-xs font-semibold uppercase text-[#795808]";
  }
  return "rounded-md bg-[#ffe1df] px-2 py-1 text-xs font-semibold uppercase text-[#8b2d28]";
}

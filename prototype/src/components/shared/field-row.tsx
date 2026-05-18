import type { ReactNode } from "react";

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[120px_1fr]">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="break-words text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

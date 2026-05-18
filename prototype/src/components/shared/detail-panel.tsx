import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function DetailPanel({ title, subtitle, onClose, children }: DetailPanelProps) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/20">
      <aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

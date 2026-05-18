import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface DialogProps {
  title: string;
  width?: "md" | "lg" | "xl" | "2xl";
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const widths = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
};

export function Dialog({ title, width = "lg", onClose, children, footer }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className={`flex max-h-[90vh] w-full ${widths[width]} flex-col rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

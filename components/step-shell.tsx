import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepShellProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  cardClassName?: string;
  headerAction?: ReactNode;
}

export function StepShell({
  step,
  totalSteps = 4,
  title,
  subtitle,
  icon,
  children,
  maxWidthClassName = "max-w-md",
  cardClassName,
  headerAction,
}: StepShellProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col" dir="rtl">

      {/* ── Header ─────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 py-3.5">
        <div className={cn("mx-auto w-full flex items-center justify-between", maxWidthClassName)}>
          {/* Logo — first child renders on the right in RTL */}
          <img src="/tameeni-logo.webp" alt="تأميني" className="h-9 w-9 rounded-xl" />

          {/* Progress dots — last child renders on the left in RTL */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isCurrent = i + 1 === step;
              const isDone    = i + 1 < step;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    isCurrent ? "w-7 h-2.5 bg-[#1976d2]"
                    : isDone   ? "w-2.5 h-2.5 bg-[#1976d2]"
                               : "w-2.5 h-2.5 bg-gray-300"
                  )}
                />
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────── */}
      <main className={cn("mx-auto w-full flex-1 px-4 py-6 space-y-4", maxWidthClassName)}>

        {/* Page title */}
        <div className="text-center space-y-1">
          {icon && (
            <div className="flex justify-center mb-2">
              <div className="w-11 h-11 rounded-full bg-[#e3f2fd] flex items-center justify-center text-[#1976d2]">
                {icon}
              </div>
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Content card */}
        <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", cardClassName)}>
          <div className="p-5 space-y-4">
            {children}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="bg-[#1a2742] py-8 px-4 mt-2">
        <div className="text-center space-y-3 max-w-md mx-auto">
          <img src="/tameeni-logo.webp" alt="تأميني" className="h-9 w-9 mx-auto rounded-xl opacity-80" />
          <p className="text-xs text-gray-400">© تأميني 2025. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

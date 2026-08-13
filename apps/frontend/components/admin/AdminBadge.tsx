"use client";

import { cn } from "@/lib/utils";

interface AdminBadgeProps {
  label: string;
  colorClass?: string; // e.g. "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  dotClass?: string;   // e.g. "bg-emerald-500"
  className?: string;
}

export function AdminBadge({ label, colorClass, dotClass, className }: AdminBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider", colorClass, className)}>
      {dotClass && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />}
      {label}
    </div>
  );
}

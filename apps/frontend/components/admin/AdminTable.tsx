"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function AdminTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-sm whitespace-nowrap">
        {children}
      </table>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--adm-border)] bg-[var(--adm-bg)]/50">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("p-4 font-semibold text-[var(--adm-text-2)] uppercase tracking-wide text-xs", className)}>
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function AdminTableRow({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-[var(--adm-border)] transition-colors hover:bg-[var(--adm-bg)]/30 group",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("p-4 text-[var(--adm-text)]", className)}>
      {children}
    </td>
  );
}

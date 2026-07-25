"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Receipt,
  Server,
  Sparkles,
  FileText,
  FolderKanban,
  User,
  GitFork,
  History,
  Settings,
  LogOut,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Pesanan", icon: ShoppingBag, href: "/admin/pesanan" },
  { label: "Klien & Website", icon: Users, href: "/admin/klien" },
  { label: "Invoice", icon: Receipt, href: "/admin/invoice" },
  { label: "Maintenance", icon: Server, href: "/admin/maintenance" },
  { label: "RevTech Studio", icon: Sparkles, href: "/admin/studio" },
  { label: "Blog", icon: FileText, href: "/admin/blog" },
  { label: "Portofolio", icon: FolderKanban, href: "/admin/portofolio" },
];

export function SidebarProfileSection() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="p-3.5 border-t shrink-0 relative" style={{ borderColor: "var(--adm-border)" }}>
      {/* Backdrop for Popover */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* Popover Menu */}
      {profileOpen && (
        <div
          style={{
            background: "var(--adm-card)",
            border: "1px solid var(--adm-border)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
          }}
          className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl p-3 space-y-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-2.5 pb-1 px-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--adm-accent), var(--adm-purple))" }}
            >
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate" style={{ color: "var(--adm-text)" }}>Superadmin</p>
              <p className="text-[10px] truncate" style={{ color: "var(--adm-text-3)" }}>hi@revtech.id</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-0.5">
            {[
              { label: "Profil", icon: User, href: "/admin/profile" },
              { label: "Tim", icon: GitFork, href: "/admin/team" },
              { label: "Activity Log", icon: History, href: "/admin/team/activity" },
              { label: "Pengaturan", icon: Settings, href: "/admin/system" },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <Link
                  key={opt.href}
                  href={opt.href}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{ color: "var(--adm-text)" }}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--adm-text)" }} />
                  <span>{opt.label}</span>
                </Link>
              );
            })}

            <Link
              href="/"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </Link>
          </div>
        </div>
      )}

      {/* Profile Trigger Button */}
      <button
        id="sidebar-profile-button"
        onClick={() => setProfileOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--adm-accent), var(--adm-purple))" }}
        >
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate leading-tight" style={{ color: "var(--adm-text)" }}>
            Superadmin
          </p>
          <p className="text-[10px] font-medium truncate" style={{ color: "var(--adm-text-3)" }}>
            Founder & CEO
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: "var(--adm-text)" }} />
      </button>
    </div>
  );
}

export function VerticalNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pt-8 pb-4">
        <div className="px-3.5 space-y-3">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-1 py-1 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)" }}
            >
              ✦
            </div>
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--adm-text)" }}>
              RevTech
            </h2>
          </div>

          {/* Navigation List */}
          <div className="space-y-2.5 pt-6">
            {NAV_ITEMS.map((item) => {
              const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
              const isActive =
                normalizedPath === item.href ||
                (item.href !== "/admin/dashboard" && normalizedPath.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-10 px-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? "bg-blue-50/60 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  onClick={onItemClick}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Pinned Profile Footer */}
      <SidebarProfileSection />
    </div>
  );
}

export function AdminSidebar({ dark }: { dark: boolean }) {
  return (
    <aside
      style={{
        width: 200,
        background: "var(--adm-sidebar)",
        borderRight: "1px solid var(--adm-border)",
        boxShadow: "var(--adm-shadow-md)",
      }}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 h-full flex-col z-30 overflow-hidden"
    >
      <VerticalNav />
    </aside>
  );
}

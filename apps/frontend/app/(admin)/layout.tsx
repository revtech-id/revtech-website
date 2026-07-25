"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar, VerticalNav } from "@/components/admin/AdminSidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDateRangePicker } from "@/components/admin/AdminDateRangePicker";
import { AdminNotificationPopover } from "@/components/admin/AdminNotificationPopover";

// ── Theme Context ─────────────────────────────────────────────────────────────

interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggle: () => {} });
export const useAdminTheme = () => useContext(ThemeContext);

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/pesanan": "Pesanan",
  "/admin/klien": "Klien & Website",
  "/admin/invoice": "Invoice",
  "/admin/maintenance": "Maintenance",
  "/admin/studio": "RevTech Studio",
  "/admin/blog": "Blog",
  "/admin/portofolio": "Portofolio",
  "/admin/team": "Struktur Tim",
  "/admin/team/activity": "Activity Log",
  "/admin/profile": "Profil Superadmin",
  "/admin/system": "System",
  "/admin/system/integrasi": "Integrasi",
  "/admin/system/pengaturan": "Pengaturan",
};

// ── Dark mode toggle pill ─────────────────────────────────────────────────────

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Sun className={`h-[18px] w-[18px] stroke-[2] transition-colors ${!dark ? "text-slate-800" : "text-slate-400"}`} />
      
      <button
        id="theme-toggle"
        onClick={onToggle}
        aria-label="Toggle dark mode"
        className={`relative w-[38px] h-[22px] rounded-full transition-colors duration-300 focus:outline-none ${
          dark ? "bg-slate-700" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
            dark ? "translate-x-[16px]" : "translate-x-0"
          }`}
        />
      </button>

      <Moon className={`h-[18px] w-[18px] stroke-[2] transition-colors ${dark ? "text-slate-200" : "text-slate-400"}`} />
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Ctrl+K global handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("adm-dark");
    if (saved === "true") setDark(true);
  }, []);

  function toggleDark() {
    setDark((d) => {
      localStorage.setItem("adm-dark", String(!d));
      return !d;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle: toggleDark }}>
      <div
        className={dark ? "admin-dark" : "admin-light"}
        style={{ minHeight: "100svh", background: "var(--adm-bg)", color: "var(--adm-text)", transition: "background 0.3s, color 0.3s" }}
      >
        {/* Desktop Sidebar */}
        <AdminSidebar dark={dark} />

        {/* Main Content Area */}
        <main className="min-h-[100svh] lg:ml-[200px] transition-all duration-200">
          {/* Topbar Header */}
          <header
            style={{
              background: "transparent",
              borderBottom: "none",
            }}
            className="sticky top-0 z-20 px-6 sm:px-8 pt-8 pb-4 flex items-center gap-3"
          >
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  aria-label="Buka menu navigasi"
                >
                  <Menu className="h-5 w-5" style={{ color: "var(--adm-text)" }} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[200px] p-0 border-r"
                style={{ background: "var(--adm-sidebar)", borderColor: "var(--adm-border)" }}
              >
                <VerticalNav onItemClick={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Page title + interactive date picker */}
            <div className="flex-1 min-w-0 flex items-center gap-5 sm:gap-6">
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight truncate shrink-0"
                style={{ color: "var(--adm-text)" }}
              >
                {pageTitle}
              </h2>
              <div className="hidden sm:block shrink-0">
                <AdminDateRangePicker />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Command palette */}
              <button
                id="topbar-cmd-palette"
                onClick={() => setCmdOpen(true)}
                className={`hidden md:flex items-center gap-2.5 px-4 py-2 w-48 rounded-full transition-all group ${
                  dark
                    ? "bg-slate-800/60 hover:bg-slate-800 border-slate-700/50"
                    : "bg-slate-100 hover:bg-slate-200/70 border-transparent"
                } border`}
              >
                <Search className={`w-4 h-4 stroke-[2.5] transition-colors ${dark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className={`flex-1 text-left text-[13.5px] font-medium transition-colors ${dark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-500 group-hover:text-slate-700"}`}>Cari...</span>
              </button>

              {/* Mobile search */}
              <button
                id="topbar-cmd-mobile"
                onClick={() => setCmdOpen(true)}
                className="md:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                aria-label="Cari"
              >
                <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>

              {/* Dark mode toggle */}
              <ThemeToggle dark={dark} onToggle={toggleDark} />

              {/* Notification */}
              <AdminNotificationPopover />
            </div>
          </header>

          <div className="p-4 sm:p-5 lg:p-6">{children}</div>
        </main>

        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      </div>
    </ThemeContext.Provider>
  );
}

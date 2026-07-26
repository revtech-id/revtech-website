"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar, VerticalNav } from "@/components/admin/AdminSidebar";

import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sun, Moon } from "lucide-react";
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
      <Sun className={`h-[15px] w-[15px] stroke-[2] transition-colors ${!dark ? "text-slate-800" : "text-slate-400"}`} />
      
      <button
        id="theme-toggle"
        onClick={onToggle}
        aria-label="Toggle dark mode"
        className={`relative w-[28px] h-[16px] rounded-full transition-colors duration-300 focus:outline-none ${
          dark ? "bg-slate-800" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[12px] h-[12px] bg-blue-500 rounded-full transition-transform duration-300 shadow-sm ${
            dark ? "translate-x-[12px]" : "translate-x-0"
          }`}
        />
      </button>

      <Moon className={`h-[15px] w-[15px] stroke-[2] transition-colors ${dark ? "text-slate-200" : "text-slate-400"}`} />
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });



  // Persist dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("adm-dark");
    if (saved === "true") {
      setDark(true);
      document.documentElement.classList.add("admin-dark");
      document.documentElement.classList.remove("admin-light");
    } else {
      document.documentElement.classList.add("admin-light");
      document.documentElement.classList.remove("admin-dark");
    }
  }, []);

  function toggleDark() {
    setDark((d) => {
      const newVal = !d;
      localStorage.setItem("adm-dark", String(newVal));
      if (newVal) {
        document.documentElement.classList.add("admin-dark");
        document.documentElement.classList.remove("admin-light");
      } else {
        document.documentElement.classList.add("admin-light");
        document.documentElement.classList.remove("admin-dark");
      }
      return newVal;
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
            className="sticky top-0 z-20 px-6 sm:px-10 lg:px-14 xl:px-16 pt-12 pb-6 flex items-center gap-3"
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

            {/* Page title / Greeting */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {pageTitle === "Dashboard" ? (
                <div className="animate-fade-in-up overflow-hidden">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate" style={{ color: "var(--adm-text)", fontFamily: "var(--font-heading)" }} title="Selamat Datang, Superadmin!">Selamat Datang, Superadmin!</h1>
                  <p className="text-[13px] mt-0.5 truncate" style={{ color: "var(--adm-text-3)" }}>Berikut adalah ringkasan operasional dan performa bisnis hari ini.</p>
                </div>
              ) : (
                <h2
                  className="text-xl sm:text-2xl font-bold tracking-tight truncate shrink-0"
                  style={{ color: "var(--adm-text)" }}
                >
                  {pageTitle}
                </h2>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 sm:gap-5 self-start mt-1.5">
              <div className="hidden sm:block shrink-0">
                <AdminDateRangePicker />
              </div>

              {/* Dark mode toggle */}
              <ThemeToggle dark={dark} onToggle={toggleDark} />

              {/* Notification */}
              <AdminNotificationPopover />
            </div>
          </header>

          <div className="px-6 sm:px-10 lg:px-14 xl:px-16 pb-16 pt-2">{children}</div>
        </main>


      </div>
    </ThemeContext.Provider>
  );
}

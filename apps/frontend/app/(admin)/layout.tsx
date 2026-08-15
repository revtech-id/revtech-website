"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AdminSidebar, VerticalNav } from "@/components/admin/AdminSidebar";

import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminDateRangePicker } from "@/components/admin/AdminDateRangePicker";
import { AdminNotificationPopover } from "@/components/admin/AdminNotificationPopover";
import { UserProvider, useUser } from "@/contexts/UserContext";

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
  "/admin/leads": "Leads",
  "/admin/projects": "Projects",
  "/admin/klien": "Klien & Website",
  "/admin/invoice": "Invoice",
  "/admin/maintenance": "Maintenance",
  "/admin/studio": "RevTech Studio",
  "/admin/blog": "Blog",
  "/admin/portofolio": "Portofolio",
  "/admin/team": "Manajemen Tim",
  "/admin/team/activity": "Activity Log",
  "/admin/profile": "Profil Saya",
  "/admin/system": "Pengaturan",
  "/admin/system/integrasi": "Integrasi",
  "/admin/system/pengaturan": "Pengaturan",
  "/admin/trash": "Tempat Sampah",
  "/admin/testimoni": "Testimoni",
  "/admin/hero": "Hero Banner",
  "/admin/jasa-web": "Jasa Web",
  "/admin/produk-digital": "Produk Digital",
  "/admin/change-password": "Ubah Kata Sandi",
};

const ROUTE_ROLES: Record<string, string[]> = {
  "/admin/dashboard": ["Superadmin", "Project Manager", "Developer", "Content Writer"],
  "/admin/leads": ["Superadmin", "Project Manager"],
  "/admin/projects": ["Superadmin", "Project Manager", "Developer"],
  "/admin/maintenance": ["Superadmin", "Project Manager"],
  "/admin/invoice": ["Superadmin", "Project Manager"],
  "/admin/studio": ["Superadmin"],
  "/admin/blog": ["Superadmin", "Content Writer"],
  "/admin/portofolio": ["Superadmin", "Developer"],
  "/admin/testimoni": ["Superadmin", "Project Manager"],
  "/admin/hero": ["Superadmin"],
  "/admin/jasa-web": ["Superadmin"],
  "/admin/produk-digital": ["Superadmin"],
  "/admin/profile": ["Superadmin", "Project Manager", "Developer", "Content Writer"],
  "/admin/team": ["Superadmin"],
  "/admin/trash": ["Superadmin", "Project Manager"],
  "/admin/system": ["Superadmin"],
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/admin/dashboard": "Berikut adalah ringkasan operasional dan performa bisnis hari ini.",
  "/admin/leads": "Pusat penerimaan prospek klien, antrean follow-up, dan konversi CRM",
  "/admin/projects": "Pipeline manajemen seluruh pesanan & proyek klien",
  "/admin/klien": "Database klien terdaftar dan pemantauan situs aktif",
  "/admin/invoice": "Kelola tagihan DP, pelunasan, dan status pembayaran",
  "/admin/maintenance": "Pemantauan masa aktif domain & hosting seluruh klien",
  "/admin/studio": "AI Copilot untuk merancang arsitektur & men-generate dokumen spesifikasi proyek",
  "/admin/blog": "Kelola artikel edukasi & konten pemasaran",
  "/admin/portofolio": "Showcase studi kasus & proyek terbaik RevTech",
  "/admin/team": "Atur akses dan peran anggota tim atau staf Anda.",
  "/admin/team/activity": "Jejak rekam pergerakan sistem & login",
  "/admin/profile": "Kelola informasi data diri, kontak, dan akses keamanan akun Anda.",
  "/admin/system": "Konfigurasi informasi profil bisnis, kontak, dan pengaturan utama",
  "/admin/trash": "Penampungan terpusat untuk memulihkan atau menghapus permanen data yang dihapus dari berbagai modul.",
  "/admin/testimoni": "Kelola ulasan dan testimoni klien",
  "/admin/hero": "Atur latar belakang untuk banner utama",
  "/admin/jasa-web": "Kelola harga paket jasa web dan opsi serah terima",
  "/admin/produk-digital": "Kelola daftar katalog produk digital",
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
  return (
    <UserProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </UserProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

  // Route Guard Effect
  useEffect(() => {
    if (!loading && user) {
      if (user.requirePasswordChange && pathname !== "/admin/change-password") {
        router.push("/admin/change-password");
        return;
      }
      
      if (!user.requirePasswordChange && pathname === "/admin/change-password") {
        router.push("/admin/dashboard");
        return;
      }

      // Check route permission
      let matchedRoute = false;
      let allowed = false;
      const role = user.role.toLowerCase();
      
      for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
        if (pathname === route || pathname.startsWith(`${route}/`)) {
          matchedRoute = true;
          if (roles.map(r => r.toLowerCase()).includes(role)) {
            allowed = true;
          }
          break;
        }
      }
      
      if (matchedRoute && !allowed && pathname !== "/admin/change-password") {
         router.push("/admin/dashboard");
      }
    }
  }, [pathname, user, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-[100svh] flex flex-col items-center justify-center bg-[var(--adm-bg)] text-[var(--adm-text)]">
        <div className="w-12 h-12 border-4 border-[var(--adm-accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-semibold text-sm">Memeriksa Akses Keamanan...</p>
      </div>
    );
  }

  if (!user) return null;

  // Prevent flashing unauthorized content
  if (user.requirePasswordChange && pathname !== "/admin/change-password") return null;

  // Render minimal layout if on change-password page
  if (pathname === "/admin/change-password") {
    return (
      <ThemeContext.Provider value={{ dark, toggle: toggleDark }}>
        <div style={{ minHeight: "100svh", background: "var(--adm-bg)", color: "var(--adm-text)", transition: "background 0.3s, color 0.3s" }}>
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle: toggleDark }}>
      <div
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
            className="relative z-10 px-6 sm:px-10 lg:px-14 xl:px-16 pt-12 pb-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4 gap-x-3"
          >
            {/* 1. Mobile Sheet Trigger (Hamburger) */}
            <div className="order-1 flex-none sm:order-none">
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
                  <VerticalNav onItemClick={() => setMobileNavOpen(false)} dark={dark} />
                </SheetContent>
              </Sheet>
            </div>

            {/* 2. Page title / Greeting */}
            <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 min-w-0 flex flex-col justify-center animate-fade-in-up overflow-hidden">
              <h1 
                className={pageTitle === "Dashboard" ? "text-2xl lg:text-3xl font-bold tracking-tight" : "text-xl sm:text-2xl font-bold tracking-tight truncate shrink-0"}
                style={pageTitle === "Dashboard" ? { color: "var(--adm-text)", fontFamily: "var(--font-heading)" } : { color: "var(--adm-text)" }}
                title={pageTitle === "Dashboard" ? `Selamat Datang, ${user?.name}` : undefined}
              >
                {pageTitle === "Dashboard" ? `Selamat Datang, ${user?.name || 'Admin'}` : pageTitle}
              </h1>
              {PAGE_DESCRIPTIONS[pathname] && (
                <p className="text-[13px] mt-0.5 truncate" style={{ color: "var(--adm-text-3)" }}>
                  {PAGE_DESCRIPTIONS[pathname]}
                </p>
              )}
            </div>

            {/* 3. Right actions */}
            <div className="order-2 flex-none flex items-center gap-3 sm:gap-5 sm:order-none sm:self-start sm:mt-1.5">
              <div className="shrink-0">
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

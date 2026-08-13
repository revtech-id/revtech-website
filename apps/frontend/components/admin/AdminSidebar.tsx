"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ShoppingBag,
  Users,
  Receipt,
  Server,
  Sparkles,
  FileText,
  FolderKanban,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  History,
  Trash2,
  Image as ImageIcon,
  Star,
  Globe,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { logActivity } from "@/lib/activityLog";
import { AdminModal, AdminButton } from "@/components/admin/ui";
import { Separator } from "@/components/ui/separator";

export const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Leads", icon: Inbox, href: "/admin/inbox" },
  { label: "Projects", icon: ShoppingBag, href: "/admin/pesanan" },
  { label: "Maintenance", icon: Server, href: "/admin/maintenance" },
  { label: "Invoice", icon: Receipt, href: "/admin/invoice" },
  { label: "RevTech Studio", icon: Sparkles, href: "/admin/studio" },
  { label: "Blog", icon: FileText, href: "/admin/blog" },
  { label: "Portofolio", icon: FolderKanban, href: "/admin/portofolio" },
  { label: "Testimoni", icon: Star, href: "/admin/testimoni" },
  { label: "Hero Banner", icon: ImageIcon, href: "/admin/hero" },
  { label: "Jasa Web", icon: Globe, href: "/admin/jasa-web" },
  { label: "Produk Digital", icon: Package, href: "/admin/produk-digital" },
];

export function SidebarProfileSection() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <div className="p-3.5 shrink-0 relative">
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
            boxShadow: "var(--adm-shadow-md)",
          }}
          className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl p-3 space-y-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-2.5 pb-1 px-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm overflow-hidden"
              style={{ background: "var(--adm-accent)" }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate" style={{ color: "var(--adm-text)" }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: "var(--adm-text-3)" }}>{user.email}</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-0.5">
            {[
              { label: "Profil", icon: User, href: "/admin/profile" },
              { label: "Activity Log", icon: History, href: "/admin/team/activity" },
              { label: "Pengaturan", icon: Settings, href: "/admin/system" },
              { label: "Tempat Sampah", icon: Trash2, href: "/admin/trash" },
            ].map((opt) => {
              const isActive = pathname === opt.href;
              const Icon = opt.icon;
              return (
                <Link
                  key={opt.href}
                  href={opt.href}
                  className={`flex items-center w-full justify-start gap-3 h-10 px-3 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-[var(--adm-card-hover)]' : 'hover:bg-[var(--adm-card-hover)]'}`}
                  style={{ color: "var(--adm-text)" }}
                  onClick={() => setProfileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--adm-text)" }} />
                  <span>{opt.label}</span>
                </Link>
              );
            })}

            <button
              className="flex items-center w-full justify-start gap-3 h-10 px-3 rounded-xl text-xs font-bold transition-colors hover:bg-[var(--adm-card-hover)] text-rose-600 dark:text-rose-400"
              onClick={() => {
                setProfileOpen(false);
                setLogoutConfirmOpen(true);
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Trigger Button */}
      <button
        id="sidebar-profile-button"
        onClick={() => setProfileOpen((o) => !o)}
        className="flex items-center w-full justify-start gap-2.5 p-2 h-auto rounded-xl transition-all text-left group hover:bg-[var(--adm-card-hover)] focus:outline-none"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm overflow-hidden"
          style={{ background: "var(--adm-accent)" }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate leading-tight" style={{ color: "var(--adm-text)" }}>
            {user.name}
          </p>
          <p className="text-[10px] font-medium truncate" style={{ color: "var(--adm-text-3)" }}>
            {user.role}
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: "var(--adm-text)" }} />
      </button>

      {/* Logout Confirmation Modal */}
      <AdminModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Konfirmasi Keluar"
        subtitle="Apakah Anda yakin ingin keluar dari dashboard admin?"
      >
        <div className="flex justify-end gap-3 mt-2">
          <AdminButton variant="ghost" onClick={() => setLogoutConfirmOpen(false)}>
            Batal
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => {
              logActivity({ type: "system", title: "Logout", description: "Admin telah keluar dari dashboard.", user: "Admin" });
              window.location.href = "/";
            }}
          >
            Ya, Keluar
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export function VerticalNav({ onItemClick, dark }: { onItemClick?: () => void, dark?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-scroll::-webkit-scrollbar { display: none !important; }
        .sidebar-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />
      <div className="sidebar-scroll flex-1 pt-12 pb-4 overflow-y-auto">
        <div className="px-3.5 space-y-3">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-1 py-1 mb-1">
             <Image src="/assets/logo.webp" alt="RevTech" width={120} height={35} className={`object-contain ${dark ? "brightness-0 invert" : ""}`} priority />
          </div>

          {/* Navigation List */}
          <div className="space-y-1.5 pt-6">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center w-full justify-start gap-3 h-10 px-3 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-[var(--adm-card-hover)]' : 'hover:bg-[var(--adm-card-hover)]'}`}
                  style={{ color: "var(--adm-text)" }}
                  onClick={onItemClick}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--adm-text)" }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

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
        boxShadow: "var(--adm-shadow-md)",
      }}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 h-full flex-col z-30 overflow-hidden"
    >
      <VerticalNav dark={dark} />
    </aside>
  );
}

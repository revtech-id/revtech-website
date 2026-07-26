"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "order" | "payment" | "system";
}

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: "1",
    title: "Pesanan Baru Masuk!",
    desc: "Paket Website Profesional dari PT Synergy Global",
    time: "5 menit lalu",
    unread: true,
    type: "order",
  },
  {
    id: "2",
    title: "Pembayaran Dikonfirmasi",
    desc: "Invoice #INV-2026-089 lunas sebesar Rp 14.500.000",
    time: "1 jam lalu",
    unread: true,
    type: "payment",
  },
  {
    id: "3",
    title: "RevTech AI Assistant v2.4",
    desc: "Fitur auto-SEO generator baru di Studio aktif",
    time: "3 jam lalu",
    unread: false,
    type: "system",
  },
];

export function AdminNotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs((list) => list.map((item) => ({ ...item, unread: false })));
  };



  return (
    <div className="relative inline-block">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Bell Button (Clean Icon-Only matching reference image) */}
      <button
        id="topbar-notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group inline-flex items-center justify-center"
        aria-label="Pemberitahuan"
      >
        <div className="relative">
          <Bell className="h-6 w-6 stroke-[2] transition-transform group-hover:scale-105" style={{ color: "var(--adm-text)" }} />
          
          {/* Red Badge pinned exactly on the right shoulder */}
          {unreadCount > 0 && (
            <span
              className="absolute top-0 right-0 flex items-center justify-center rounded-full pointer-events-none"
              style={{
                background: "#ff3b30",
                width: "15px",
                height: "15px",
                minWidth: "15px",
                minHeight: "15px",
                fontSize: "9px",
                fontWeight: "900",
                color: "white",
                transform: "translate(35%, -25%)",
                lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Notification Dropdown Popover */}
      {open && (
        <div
          style={{
            background: "var(--adm-card)",
            border: "1px solid var(--adm-border)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
          className="absolute right-0 top-full mt-3 w-80 sm:w-96 z-50 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800" style={{ fontSize: '9px' }}>
                  {unreadCount} Baru
                </span>
              )}
            </div>

            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Tandai dibaca
              </button>
            ) : notifs.length > 0 ? (
              <button
                onClick={() => setNotifs([])}
                className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
              >
                Bersihkan
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar py-2 pl-2 pr-2.5 space-y-2">
            {notifs.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300">Belum ada aktivitas</p>
                <p className="text-[10px] text-slate-400 mt-1">Anda sudah melihat semuanya.</p>
              </div>
            ) : (
              notifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setNotifs((list) =>
                      list.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                    );
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    item.unread
                      ? "bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      : "opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {item.unread ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  ) : (
                    <div className="w-1.5 h-1.5 shrink-0 mt-1.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-[12px] truncate transition-colors ${item.unread ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"}`}>
                        {item.title}
                      </p>
                      <span className="font-medium shrink-0 text-slate-400 dark:text-slate-500" style={{ fontSize: '9px' }}>
                        {item.time}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-2 mt-0.5 transition-colors ${item.unread ? "text-slate-600 dark:text-slate-400 font-medium" : "text-slate-500 dark:text-slate-500"}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <Link
              href="/admin/team/activity"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              Lihat Semua Aktivitas Sistem
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

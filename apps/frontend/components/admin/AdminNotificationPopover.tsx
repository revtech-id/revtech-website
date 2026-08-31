"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "order" | "payment" | "system";
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // if future date or just now
  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminNotificationPopover() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  const isManager = user?.role === "Superadmin" || user?.role === "Project Manager";

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(50));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const dbLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      const readIds: string[] = JSON.parse(localStorage.getItem("revtech_notif_read") || "[]");
      // ID yang sudah dihapus/bersihkan — tidak boleh muncul lagi
      const dismissedIds: string[] = JSON.parse(localStorage.getItem("revtech_notif_dismissed") || "[]");

      let filteredLog = dbLogs.filter(entry =>
        entry.notify === true && !dismissedIds.includes(entry.id)
      );
      
      if (user?.role === "Content Writer") {
        const hiddenTypes = ["payment", "lead_created", "lead_added", "lead_deal", "invoice_paid", "order_lunas", "lead_paid_full", "order_status_changed", "order_handover", "order_created"];
        filteredLog = filteredLog.filter(entry => !hiddenTypes.includes(entry.type));
      } else if (user?.role === "Developer") {
        const hiddenTypes = ["payment", "lead_created", "lead_added", "lead_deal", "invoice_paid", "order_lunas", "lead_paid_full"];
        filteredLog = filteredLog.filter(entry => !hiddenTypes.includes(entry.type));
      }

      const dynamicNotifs: NotificationItem[] = filteredLog.slice(0, 15).map((entry) => ({
        id: entry.id,
        title: entry.type === "lead_created" ? "Prospek Baru Masuk!"
          : entry.type === "lead_added" ? "Prospek Ditambahkan"
          : entry.type === "lead_deal" ? "Deal Baru!"
          : entry.type === "order_status_changed" ? "Status Project Berubah"
          : entry.type === "order_handover" ? "Project Selesai"
          : entry.type === "invoice_paid" || entry.type === "order_lunas" || entry.type === "lead_paid_full" ? "Pembayaran Diterima"
          : entry.type === "login" ? "Aktivitas Login"
          : "Notifikasi Sistem",
        desc: entry.description,
        time: getTimeAgo(entry.timestamp),
        unread: !readIds.includes(entry.id),
        type: (
          entry.type === "lead_created" || entry.type === "lead_added" || entry.type === "lead_deal" || entry.type === "order_status_changed" || entry.type === "order_handover"
            ? "order"
            : entry.type === "invoice_paid" || entry.type === "order_lunas" || entry.type === "lead_paid_full"
              ? "payment"
              : "system"
        ) as "order" | "payment" | "system",
      }));

      setNotifs(dynamicNotifs);
    });

    const handleStorage = (e: StorageEvent) => {
      // Still need this for "mark all as read" sync across tabs if we want, or inbox
      if (e.key === "revtech_inbox") {
        // inbox handling not implemented here currently
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", handleStorage);
    };
  }, [isManager, user]);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    const existingIds = JSON.parse(localStorage.getItem("revtech_notif_read") || "[]");
    const currentUnreadIds = notifs.filter((n) => n.unread).map((n) => n.id);
    const newReadIds = Array.from(new Set([...existingIds, ...currentUnreadIds]));
    localStorage.setItem("revtech_notif_read", JSON.stringify(newReadIds));
    setNotifs((list) => list.map((item) => ({ ...item, unread: false })));
  };



  return (
    <div className="relative inline-block">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Bell Button (Clean Icon-Only matching reference image) */}
      <button
        id="topbar-notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-1.5 rounded-xl transition-all group inline-flex items-center justify-center"
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
            boxShadow: "var(--adm-shadow-md)",
          }}
          className="absolute right-0 top-full mt-3 w-80 sm:w-96 z-50 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--adm-border)]">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[13px] font-bold" style={{ color: "var(--adm-text)" }}>
                Notifikasi
              </h3>
              {/* Badge removed */}
            </div>

            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold transition-colors opacity-70 hover:opacity-100"
                style={{ color: "var(--adm-text)" }}
              >
                Tandai dibaca
              </button>
            ) : notifs.length > 0 ? (
              <button
                onClick={() => {
                  // Simpan semua ID notif saat ini ke dismissed agar tidak muncul lagi
                  const existingDismissed: string[] = JSON.parse(localStorage.getItem("revtech_notif_dismissed") || "[]");
                  const allCurrentIds = notifs.map((n) => n.id);
                  const newDismissed = Array.from(new Set([...existingDismissed, ...allCurrentIds]));
                  localStorage.setItem("revtech_notif_dismissed", JSON.stringify(newDismissed));
                  setNotifs([]);
                }}
                className="text-[10px] font-semibold transition-colors opacity-70 hover:opacity-100"
                style={{ color: "var(--adm-danger)" }}
              >
                Bersihkan
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar py-2 pl-2 pr-2.5 space-y-2">
            {notifs.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--adm-bg)" }}>
                  <Bell className="w-5 h-5" style={{ color: "var(--adm-text-3)" }} />
                </div>
                <p className="text-[12px] font-bold" style={{ color: "var(--adm-text)" }}>Belum ada aktivitas</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--adm-text-2)" }}>Anda sudah melihat semuanya.</p>
              </div>
            ) : (
              notifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setNotifs((list) =>
                      list.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                    );
                    if (item.unread) {
                      const existingIds = JSON.parse(localStorage.getItem("revtech_notif_read") || "[]");
                      if (!existingIds.includes(item.id)) {
                        existingIds.push(item.id);
                        localStorage.setItem("revtech_notif_read", JSON.stringify(existingIds));
                      }
                    }
                  }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-[var(--adm-bg)] ${
                    item.unread ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-[12px] truncate transition-colors ${item.unread ? "font-bold" : "font-medium"}`} style={{ color: "var(--adm-text)" }}>
                        {item.title}
                      </p>
                      <span className="font-medium shrink-0" style={{ fontSize: '9px', color: "var(--adm-text-3)" }}>
                        {item.time}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-2 mt-0.5 transition-colors ${item.unread ? "font-medium" : ""}`} style={{ color: item.unread ? "var(--adm-text-2)" : "var(--adm-text-3)" }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {user?.role === "Superadmin" && (
            <div className="px-5 py-2.5 border-t border-[var(--adm-border)]">
              <Link
                href="/admin/team/activity"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-semibold transition-colors hover:opacity-100 opacity-70"
                style={{ color: "var(--adm-text)" }}
              >
                Lihat Semua Aktivitas Sistem
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

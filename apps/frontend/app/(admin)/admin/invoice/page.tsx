"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge, AdminTable } from "@/components/admin/ui";
import rawInvoices from "@/data/admin/invoices.json";

interface Invoice {
  id: string;
  orderId: string;
  client: string;
  phone?: string;
  type: "dp" | "pelunasan" | "maintenance";
  amount: number;
  status: "paid" | "pending";
  issuedAt: string;
  paidAt: string | null;
  dueDate: string;
  description: string;
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function isOverdue(dueDate: string, status: string) {
  return status === "pending" && new Date(dueDate) < new Date();
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring" as const, stiffness: 300, damping: 24 } },
});

const EMPTY_FORM = {
  client: "", phone: "", orderId: "", type: "dp" as "dp" | "pelunasan" | "maintenance",
  amount: 0, dueDate: "", description: ""
};

export default function InvoicePage() {
  const [isClient, setIsClient] = useState(false);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [view, setView] = useState<"list" | "form">("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [orders, setOrders] = useState<{ id: string; client: string; phone: string; dp: number; total: number }[]>([]);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_invoices");
    let currentInvoices: Invoice[] = saved ? JSON.parse(saved) : (rawInvoices as Invoice[]);

    // Auto-sync pesanan untuk invoice dan dropdown
    const savedOrders = localStorage.getItem("revtech_orders");
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(parsedOrders.map((o: any) => ({
        id: o.id, client: o.client, phone: o.phone || "",
        dp: o.dp || 0, total: o.total || 0
      })));
      
      let changed = false;
      parsedOrders.forEach((o: any) => {
        // Sync DP Invoice
        if (o.dp > 0) {
          const dpInvId = `INV-DP-${o.id}`;
          const existingDp = currentInvoices.find(inv => inv.id === dpInvId);
          const isDpPaid = ["handover", "selesai"].includes(o.status);
          if (!existingDp) {
            changed = true;
            currentInvoices.push({
              id: dpInvId, orderId: o.id, client: o.client, phone: o.phone, type: "dp",
              amount: o.dp, status: isDpPaid ? "paid" : "pending",
              issuedAt: o.createdAt.split("T")[0], paidAt: isDpPaid ? new Date().toISOString().split("T")[0] : null,
              dueDate: o.deadline || o.createdAt.split("T")[0],
              description: `DP 50% — ${o.client}`
            });
          } else if (existingDp.status === "pending" && isDpPaid) {
            changed = true;
            existingDp.status = "paid";
            existingDp.paidAt = new Date().toISOString().split("T")[0];
          }
        }
        
        // Sync Pelunasan Invoice
        if (o.total > o.dp) {
          const pelInvId = `INV-PL-${o.id}`;
          const existingPel = currentInvoices.find(inv => inv.id === pelInvId);
          const isPelPaid = o.status === "selesai";
          if (!existingPel) {
            changed = true;
            currentInvoices.push({
              id: pelInvId, orderId: o.id, client: o.client, phone: o.phone, type: "pelunasan",
              amount: o.total - o.dp, status: isPelPaid ? "paid" : "pending",
              issuedAt: o.createdAt.split("T")[0], paidAt: isPelPaid ? new Date().toISOString().split("T")[0] : null,
              dueDate: o.deadline || o.createdAt.split("T")[0],
              description: `Pelunasan — ${o.client}`
            });
          } else if (existingPel.status === "pending" && isPelPaid) {
            changed = true;
            existingPel.status = "paid";
            existingPel.paidAt = new Date().toISOString().split("T")[0];
          }
        }
      });
      
      if (changed) {
        currentInvoices.sort((a,b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
        localStorage.setItem("revtech_invoices", JSON.stringify(currentInvoices));
      }
    }
    
    setInvoiceList(currentInvoices);
    if (!saved) localStorage.setItem("revtech_invoices", JSON.stringify(currentInvoices));
  }, []);

  function save(updated: Invoice[]) {
    setInvoiceList(updated);
    localStorage.setItem("revtech_invoices", JSON.stringify(updated));
  }

  function markPaid(id: string) {
    save(invoiceList.map(inv =>
      inv.id === id ? { ...inv, status: "paid", paidAt: new Date().toISOString().split("T")[0] } : inv
    ));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newInv: Invoice = {
      id: `INV-${Date.now().toString().slice(-5)}`,
      orderId: form.orderId,
      client: form.client,
      phone: form.phone,
      type: form.type,
      amount: Number(form.amount),
      status: "pending",
      issuedAt: new Date().toISOString().split("T")[0],
      paidAt: null,
      dueDate: form.dueDate,
      description: form.description || `${form.type === "dp" ? "DP 50%" : "Pelunasan"} — ${form.client}`,
    };
    save([newInv, ...invoiceList]);
    setForm(EMPTY_FORM);
    setView("list");
  }

  function handleOrderSelect(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setForm(f => ({
        ...f, orderId, client: order.client, phone: order.phone,
        amount: f.type === "dp" ? order.dp : order.total - order.dp,
        description: `${f.type === "dp" ? "DP 50%" : "Pelunasan"} — ${order.client}`
      }));
    }
  }

  const filtered = filter === "all" ? invoiceList : invoiceList.filter(i => i.status === filter);
  const totalPaid = invoiceList.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoiceList.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoiceList.filter(i => isOverdue(i.dueDate, i.status));

  if (!isClient) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 mt-2">
        {view === "form" ? (
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
        ) : <div />}
        {view === "list" && (
          <button
            id="add-invoice"
            onClick={() => { setForm(EMPTY_FORM); setView("form"); }}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[var(--adm-accent)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-[var(--adm-shadow-md)]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Buat Invoice
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Total Terbayar", value: formatRp(totalPaid), icon: "check_circle", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
              { label: "Menunggu Pembayaran", value: formatRp(totalPending), icon: "pending", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
              { label: "Jatuh Tempo", value: String(overdue.length), icon: "warning", iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
            ].map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i)} className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] p-4 shadow-[var(--adm-shadow)] flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--adm-text-2)]">{s.label}</p>
                  <p className="text-lg font-bold text-[var(--adm-text)]">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            {(["all", "paid", "pending"] as const).map(f => (
              <button
                key={f}
                id={`filter-invoice-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[var(--adm-accent)] text-white" : "bg-[var(--adm-card)] text-[var(--adm-text-2)] border border-[var(--adm-border)] hover:bg-[var(--adm-bg)]"}`}
              >
                {f === "all" ? "Semua" : f === "paid" ? "Lunas" : "Pending"}
              </button>
            ))}
          </div>

          <motion.div {...fadeUp(3)}>
            <AdminTable
              keyField="id"
              data={filtered}
              emptyMessage="Tidak ada invoice"
              columns={[
                {
                  key: "id", label: "Invoice",
                  render: (inv) => (
                    <div>
                      <p className="font-mono text-xs font-semibold text-[var(--adm-text)]">{inv.id}</p>
                      <p className="text-xs text-[var(--adm-text-3)]">{inv.orderId}</p>
                    </div>
                  ),
                },
                {
                  key: "client", label: "Klien",
                  render: (inv) => (
                    <div>
                      <p className="font-medium text-[var(--adm-text)]">{inv.client}</p>
                      {inv.phone && (
                        <a href={`https://wa.me/${inv.phone}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-500 hover:underline">{inv.phone}</a>
                      )}
                    </div>
                  ),
                },
                {
                  key: "description", label: "Deskripsi",
                  render: (inv) => (
                    <div>
                      <p className="text-sm text-[var(--adm-text)]">{inv.description}</p>
                      <StatusBadge label={inv.type === "dp" ? "DP" : "Pelunasan"} variant={inv.type === "dp" ? "amber" : "indigo"} />
                    </div>
                  ),
                },
                {
                  key: "amount", label: "Jumlah",
                  render: (inv) => <span className="font-bold text-[var(--adm-text)]">{formatRp(inv.amount)}</span>,
                },
                {
                  key: "dueDate", label: "Jatuh Tempo",
                  render: (inv) => (
                    <span className={`text-xs ${isOverdue(inv.dueDate, inv.status) ? "text-rose-500 font-semibold" : "text-[var(--adm-text-3)]"}`}>
                      {new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {isOverdue(inv.dueDate, inv.status) && " ⚠️"}
                    </span>
                  ),
                },
                {
                  key: "status", label: "Status",
                  render: (inv) => (
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={inv.status === "paid" ? "Lunas" : isOverdue(inv.dueDate, inv.status) ? "Terlambat" : "Pending"}
                        variant={inv.status === "paid" ? "emerald" : isOverdue(inv.dueDate, inv.status) ? "rose" : "amber"}
                      />
                      {inv.status === "pending" && (
                        <button
                          id={`mark-paid-${inv.id}`}
                          onClick={(e) => { e.stopPropagation(); markPaid(inv.id); }}
                          className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-400 transition-colors whitespace-nowrap"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </motion.div>
        </>
      )}

      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] p-6 sm:p-8 shadow-[var(--adm-shadow)]">
            <h2 className="text-xl font-bold text-[var(--adm-text)] mb-6">Buat Invoice Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Link ke Pesanan */}
              {orders.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Tautkan ke Pesanan (Opsional)</label>
                  <select
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="" className="bg-[var(--adm-card)]">— Pilih Pesanan —</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id} className="bg-[var(--adm-card)]">{o.id} · {o.client}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nama Klien *</label>
                  <input required type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Nama klien" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nomor WhatsApp</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="628xxxxxxxxxx" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Tipe Invoice *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "dp" | "pelunasan" })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="dp" className="bg-[var(--adm-card)]">DP (Down Payment)</option>
                    <option value="pelunasan" className="bg-[var(--adm-card)]">Pelunasan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Jumlah (Rp) *</label>
                  <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Jatuh Tempo *</label>
                <input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Deskripsi</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Cth: DP 50% Website Company Profile" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--adm-border)]">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-[var(--adm-text-2)] hover:bg-[var(--adm-bg)] transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--adm-accent)] text-white hover:opacity-90 transition-colors shadow-sm text-sm">Simpan Invoice</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}

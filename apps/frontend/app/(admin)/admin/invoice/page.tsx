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
  type: "dp" | "pelunasan";
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
  client: "", phone: "", orderId: "", type: "dp" as "dp" | "pelunasan",
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
    setInvoiceList(saved ? JSON.parse(saved) : rawInvoices as Invoice[]);
    if (!saved) localStorage.setItem("revtech_invoices", JSON.stringify(rawInvoices));

    // Load pesanan untuk dropdown
    const savedOrders = localStorage.getItem("revtech_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders).map((o: any) => ({
        id: o.id, client: o.client, phone: o.phone || "",
        dp: o.dp || 0, total: o.total || 0
      })));
    }
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
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-slate-600">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
        ) : <div />}
        {view === "list" && (
          <button
            id="add-invoice"
            onClick={() => { setForm(EMPTY_FORM); setView("form"); }}
            className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
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
              { label: "Total Terbayar", value: formatRp(totalPaid), icon: "check_circle", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
              { label: "Menunggu Pembayaran", value: formatRp(totalPending), icon: "pending", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
              { label: "Jatuh Tempo", value: String(overdue.length), icon: "warning", iconBg: "bg-rose-50", iconColor: "text-rose-600" },
            ].map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i)} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
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
                      <p className="font-mono text-xs font-semibold text-slate-700">{inv.id}</p>
                      <p className="text-xs text-slate-400">{inv.orderId}</p>
                    </div>
                  ),
                },
                {
                  key: "client", label: "Klien",
                  render: (inv) => (
                    <div>
                      <p className="font-medium text-slate-800">{inv.client}</p>
                      {inv.phone && (
                        <a href={`https://wa.me/${inv.phone}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline">{inv.phone}</a>
                      )}
                    </div>
                  ),
                },
                {
                  key: "description", label: "Deskripsi",
                  render: (inv) => (
                    <div>
                      <p className="text-sm text-slate-700">{inv.description}</p>
                      <StatusBadge label={inv.type === "dp" ? "DP" : "Pelunasan"} variant={inv.type === "dp" ? "amber" : "indigo"} />
                    </div>
                  ),
                },
                {
                  key: "amount", label: "Jumlah",
                  render: (inv) => <span className="font-bold text-slate-900">{formatRp(inv.amount)}</span>,
                },
                {
                  key: "dueDate", label: "Jatuh Tempo",
                  render: (inv) => (
                    <span className={`text-xs ${isOverdue(inv.dueDate, inv.status) ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
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
                          className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Buat Invoice Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Link ke Pesanan */}
              {orders.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tautkan ke Pesanan (Opsional)</label>
                  <select
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">— Pilih Pesanan —</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} · {o.client}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nama Klien *</label>
                  <input required type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Nama klien" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nomor WhatsApp</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="628xxxxxxxxxx" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tipe Invoice *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "dp" | "pelunasan" })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="dp">DP (Down Payment)</option>
                    <option value="pelunasan">Pelunasan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Jumlah (Rp) *</label>
                  <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Jatuh Tempo *</label>
                <input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Deskripsi</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Cth: DP 50% Website Company Profile" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm text-sm">Simpan Invoice</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}

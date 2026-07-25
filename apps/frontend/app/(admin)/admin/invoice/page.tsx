"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, StatusBadge, AdminTable } from "@/components/admin/ui";
import rawInvoices from "@/data/admin/invoices.json";

interface Invoice {
  id: string;
  orderId: string;
  client: string;
  type: "dp" | "pelunasan";
  amount: number;
  status: "paid" | "pending";
  issuedAt: string;
  paidAt: string | null;
  dueDate: string;
  description: string;
}

const invoices: Invoice[] = rawInvoices as Invoice[];

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

export default function InvoicePage() {
  // TODO: replace with API call
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(invoices);
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const totalPaid = invoiceList.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoiceList.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoiceList.filter((i) => isOverdue(i.dueDate, i.status));

  function markPaid(id: string) {
    setInvoiceList((prev) =>
      prev.map((inv) => inv.id === id ? { ...inv, status: "paid", paidAt: new Date().toISOString().split("T")[0] } : inv)
    );
  }

  const filtered = filter === "all" ? invoiceList : invoiceList.filter((i) => i.status === filter);

  return (
    <div>
      <PageHeader
        title="Invoice"
        description="Kelola tagihan DP, pelunasan, dan status pembayaran"
        icon="receipt_long"
        action={
          <button
            id="add-invoice"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Buat Invoice
          </button>
        }
      />

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
        {(["all", "paid", "pending"] as const).map((f) => (
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
              key: "id",
              label: "Invoice",
              render: (inv) => (
                <div>
                  <p className="font-mono text-xs font-semibold text-slate-700">{inv.id}</p>
                  <p className="text-xs text-slate-400">{inv.orderId}</p>
                </div>
              ),
            },
            {
              key: "client",
              label: "Klien",
              render: (inv) => <span className="font-medium text-slate-800">{inv.client}</span>,
            },
            {
              key: "description",
              label: "Deskripsi",
              render: (inv) => (
                <div>
                  <p className="text-sm text-slate-700">{inv.description}</p>
                  <StatusBadge label={inv.type === "dp" ? "DP" : "Pelunasan"} variant={inv.type === "dp" ? "amber" : "indigo"} />
                </div>
              ),
            },
            {
              key: "amount",
              label: "Jumlah",
              render: (inv) => <span className="font-bold text-slate-900">{formatRp(inv.amount)}</span>,
            },
            {
              key: "dueDate",
              label: "Jatuh Tempo",
              render: (inv) => (
                <span className={`text-xs ${isOverdue(inv.dueDate, inv.status) ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                  {new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  {isOverdue(inv.dueDate, inv.status) && " ⚠️"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
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
                      className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
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
    </div>
  );
}

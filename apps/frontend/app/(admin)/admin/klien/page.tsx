"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, StatusBadge, AdminTable, EmptyState } from "@/components/admin/ui";
import rawClients from "@/data/admin/clients.json";

interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  website: string | null;
  websiteStatus: "active" | "pending" | "down";
  joinDate: string;
  totalSpend: number;
  activeProjects: number;
  domain: string | null;
  domainExpiry: string | null;
  hosting: string | null;
  hostingExpiry: string | null;
}

const clients: Client[] = rawClients as Client[];

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function KlienPage() {
  // TODO: replace with API call
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const expiringDomains = clients.filter((c) => {
    const days = daysUntil(c.domainExpiry);
    return days !== null && days <= 60;
  });

  return (
    <div>
      <PageHeader
        title="Klien & Website"
        description="Database klien terdaftar dan pemantauan situs aktif"
        icon="group"
        action={
          <button
            id="add-client"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Tambah Klien
          </button>
        }
      />

      {/* Expiring domains alert */}
      {expiringDomains.length > 0 && (
        <motion.div {...fadeUp(0)} className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Domain/Hosting akan kadaluarsa</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {expiringDomains.map((c) => `${c.name} (${c.domain} — ${daysUntil(c.domainExpiry)} hari lagi)`).join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div {...fadeUp(1)} className="mb-4">
        <div className="relative max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            id="client-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau kontak..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div {...fadeUp(2)}>
        <AdminTable
          keyField="id"
          data={filtered}
          onRowClick={(c) => setSelectedClient(c)}
          emptyMessage="Tidak ada klien ditemukan"
          columns={[
            {
              key: "name",
              label: "Klien",
              render: (c) => (
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.contact} · {c.phone}</p>
                </div>
              ),
            },
            {
              key: "website",
              label: "Website",
              render: (c) => c.website ? (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
                  {c.domain}
                </a>
              ) : <span className="text-slate-300">—</span>,
            },
            {
              key: "websiteStatus",
              label: "Status",
              render: (c) => (
                <StatusBadge
                  label={c.websiteStatus === "active" ? "Aktif" : c.websiteStatus === "pending" ? "Pending" : "Down"}
                  variant={c.websiteStatus === "active" ? "emerald" : c.websiteStatus === "pending" ? "amber" : "rose"}
                />
              ),
            },
            {
              key: "domainExpiry",
              label: "Kadaluarsa Domain",
              render: (c) => {
                const days = daysUntil(c.domainExpiry);
                if (days === null) return <span className="text-slate-300">—</span>;
                return (
                  <span className={`text-xs font-medium ${days <= 30 ? "text-rose-600" : days <= 60 ? "text-amber-600" : "text-slate-500"}`}>
                    {new Date(c.domainExpiry!).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    {days <= 60 && <span className="ml-1">({days}h)</span>}
                  </span>
                );
              },
            },
            {
              key: "totalSpend",
              label: "Total Belanja",
              render: (c) => <span className="text-sm font-semibold text-slate-700">{formatRp(c.totalSpend)}</span>,
            },
            {
              key: "activeProjects",
              label: "Proyek Aktif",
              render: (c) => (
                <span className={`text-sm font-semibold ${c.activeProjects > 0 ? "text-blue-600" : "text-slate-400"}`}>
                  {c.activeProjects}
                </span>
              ),
            },
          ]}
        />
      </motion.div>

      {/* Client detail drawer */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-slate-900/30 z-40"
          onClick={() => setSelectedClient(null)}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{selectedClient.name}</h2>
              <button id="close-client-drawer" onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto h-full pb-20">
              <Section label="Kontak">
                <Row label="Nama" value={selectedClient.contact} />
                <Row label="WhatsApp" value={selectedClient.phone} />
                <Row label="Email" value={selectedClient.email} />
                <Row label="Gabung Sejak" value={new Date(selectedClient.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
              </Section>
              <Section label="Website & Domain">
                <Row label="Website" value={selectedClient.website ?? "—"} />
                <Row label="Domain" value={selectedClient.domain ?? "—"} />
                <Row label="Kadaluarsa Domain" value={selectedClient.domainExpiry ? new Date(selectedClient.domainExpiry).toLocaleDateString("id-ID") : "—"} />
                <Row label="Hosting" value={selectedClient.hosting ?? "—"} />
                <Row label="Kadaluarsa Hosting" value={selectedClient.hostingExpiry ? new Date(selectedClient.hostingExpiry).toLocaleDateString("id-ID") : "—"} />
              </Section>
              <Section label="Keuangan">
                <Row label="Total Belanja" value={formatRp(selectedClient.totalSpend)} />
                <Row label="Proyek Aktif" value={String(selectedClient.activeProjects)} />
              </Section>
              <a
                href={`https://wa.me/${selectedClient.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
              >
                🟢 Hubungi via WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <div className="bg-slate-50 rounded-xl divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800 text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

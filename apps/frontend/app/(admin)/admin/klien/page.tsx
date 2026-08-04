"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge, AdminTable, AdminToolbar } from "@/components/admin/ui";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import rawClients from "@/data/admin/clients.json";

const SERVICE_TABS = ["Semua", "Jasa Website", "Produk Digital", "Custom Project"];

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
  service?: string;
}

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

const EMPTY_FORM = {
  name: "", contact: "", phone: "", email: "",
  website: "", domain: "", domainExpiry: "",
  hosting: "", hostingExpiry: "", websiteStatus: "active" as "active" | "pending" | "down", service: ""
};

export default function KlienPage() {
  const [isClient, setIsClient] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const savedClients = localStorage.getItem("revtech_clients");
    let currentClients: Client[] = savedClients ? JSON.parse(savedClients) : (rawClients as Client[]);
    
    // Auto-sync from finished orders
    const savedOrders = localStorage.getItem("revtech_orders");
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const finishedOrders = orders.filter((o: any) => o.status === "selesai");
      
      let changed = false;
      finishedOrders.forEach((o: any) => {
        // Cek apakah order ini sudah dimasukkan ke klien
        // Kita gunakan id order sebagai id klien agar tidak duplikat
        if (!currentClients.find(c => c.id === o.id)) {
          changed = true;
          currentClients.unshift({
            id: o.id,
            name: o.client,
            contact: o.client,
            phone: o.phone,
            email: "",
            website: o.handover || null,
            websiteStatus: "active",
            joinDate: o.createdAt.split("T")[0],
            totalSpend: o.total || 0,
            activeProjects: 1,
            domain: o.handoverOption === "Terima Beres" ? "Dikelola RevTech" : null,
            domainExpiry: o.nextBillingDate || null,
            hosting: o.handoverOption === "Terima Beres" ? "Dikelola RevTech" : null,
            hostingExpiry: o.nextBillingDate || null,
            service: o.service
          });
        }
      });
      
      if (changed) {
        localStorage.setItem("revtech_clients", JSON.stringify(currentClients));
      }
    }
    
    setClients(currentClients);
    if (!savedClients) localStorage.setItem("revtech_clients", JSON.stringify(currentClients));
  }, []);

  function save(updated: Client[]) {
    setClients(updated);
    localStorage.setItem("revtech_clients", JSON.stringify(updated));
  }

  function handleEdit(c: Client) {
    setForm({
      name: c.name, contact: c.contact, phone: c.phone, email: c.email,
      website: c.website || "", domain: c.domain || "",
      domainExpiry: c.domainExpiry || "", hosting: c.hosting || "",
      hostingExpiry: c.hostingExpiry || "", websiteStatus: c.websiteStatus, service: c.service || ""
    });
    setEditingId(c.id);
    setSelectedClient(null);
    setView("form");
  }

  function handleDelete(id: string) {
    save(clients.filter(c => c.id !== id));
    setDeletingId(null);
    setSelectedClient(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let updated = [...clients];
    if (editingId) {
      updated = clients.map(c => c.id === editingId ? {
        ...c, name: form.name, contact: form.contact, phone: form.phone,
        email: form.email, website: form.website || null, domain: form.domain || null,
        domainExpiry: form.domainExpiry || null, hosting: form.hosting || null,
        hostingExpiry: form.hostingExpiry || null, websiteStatus: form.websiteStatus, service: form.service || undefined
      } : c);
    } else {
      updated = [{
        id: `CLN-${Date.now().toString().slice(-5)}`,
        name: form.name, contact: form.contact, phone: form.phone,
        email: form.email, website: form.website || null, domain: form.domain || null,
        domainExpiry: form.domainExpiry || null, hosting: form.hosting || null,
        hostingExpiry: form.hostingExpiry || null, websiteStatus: form.websiteStatus,
        joinDate: new Date().toISOString().split("T")[0],
        totalSpend: 0, activeProjects: 0, service: form.service || undefined
      }, ...clients];
    }
    save(updated);
    setView("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  const filtered = clients.filter(c => {
    const matchStatus = statusFilter === "Semua" || (
      statusFilter === "Aktif" ? c.websiteStatus === "active" :
      statusFilter === "Pending" ? c.websiteStatus === "pending" :
      c.websiteStatus === "down"
    );
    const matchService = serviceFilter === "Semua" || (c.service && c.service.includes(serviceFilter));
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchService && matchSearch;
  });

  const expiringDomains = clients.filter(c => {
    const days = daysUntil(c.domainExpiry);
    return days !== null && days <= 60;
  });

  if (!isClient) return null;

  return (
    <div>
      {/* Toolbar */}
      {/* Toolbar */}
      <AdminToolbar
        view={view}
        onBack={() => setView("list")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, email, atau kontak..."
        dropdown={
          <div className="relative flex items-center shrink-0">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer w-full"
            >
              {SERVICE_TABS.map(s => (
                <option key={s} value={s} className="bg-[var(--adm-card)] text-[var(--adm-text)]">{s === "Semua" ? "Semua Layanan" : s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3">
              <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
            </div>
          </div>
        }
        onAdd={() => { setEditingId(null); setForm(EMPTY_FORM); setView("form"); }}
        addLabel="Klien Baru"
        addIcon="add"
      />

      {view === "list" && (
        <>
          {/* Expiring alert */}
          {expiringDomains.length > 0 && (
            <motion.div {...fadeUp(0)} className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Domain/Hosting akan kadaluarsa dalam 60 hari</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {expiringDomains.map(c => `${c.name} (${c.domain} — ${daysUntil(c.domainExpiry)} hari lagi)`).join(", ")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions Row */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center shrink-0">
              <div className="relative flex items-center justify-center shrink-0 group">
                <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
                  <SlidersHorizontal size={18} strokeWidth={2.5} />
                </button>
                <select
                  dir="rtl"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Filter Status"
                >
                  <option value="Semua" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Semua Status</option>
                  <option value="Aktif" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Aktif</option>
                  <option value="Pending" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Pending</option>
                  <option value="Down" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Down</option>
                </select>
              </div>
            </div>
          </div>

          <motion.div {...fadeUp(1)}>
            <AdminTable
              keyField="id"
              data={filtered}
              onRowClick={c => setSelectedClient(c)}
              emptyMessage="Tidak ada klien ditemukan"
              columns={[
                {
                  key: "name", label: "Klien",
                  render: c => (
                    <div>
                      <p className="font-semibold text-[var(--adm-text)]">{c.name}</p>
                      <p className="text-xs text-[var(--adm-text-3)]">{c.contact} · {c.phone}</p>
                    </div>
                  ),
                },
                {
                  key: "website", label: "Website",
                  render: c => c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs" onClick={e => e.stopPropagation()}>
                      {c.domain}
                    </a>
                  ) : <span className="text-[var(--adm-text-3)]">—</span>,
                },
                {
                  key: "websiteStatus", label: "Status",
                  render: c => (
                    <StatusBadge
                      label={c.websiteStatus === "active" ? "Aktif" : c.websiteStatus === "pending" ? "Pending" : "Down"}
                      variant={c.websiteStatus === "active" ? "emerald" : c.websiteStatus === "pending" ? "amber" : "rose"}
                    />
                  ),
                },
                {
                  key: "domainExpiry", label: "Kadaluarsa Domain",
                  render: c => {
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
                  key: "totalSpend", label: "Total Belanja",
                  render: c => <span className="text-sm font-semibold text-[var(--adm-text)]">{formatRp(c.totalSpend)}</span>,
                },
                {
                  key: "activeProjects", label: "Proyek Aktif",
                  render: c => (
                    <span className={`text-sm font-semibold ${c.activeProjects > 0 ? "text-blue-500" : "text-[var(--adm-text-3)]"}`}>
                      {c.activeProjects}
                    </span>
                  ),
                },
              ]}
            />
          </motion.div>
        </>
      )}

      {/* Form Tambah / Edit */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] p-6 sm:p-8 shadow-[var(--adm-shadow)]">
            <h2 className="text-xl font-bold text-[var(--adm-text)] mb-6">{editingId ? "Edit Data Klien" : "Tambah Klien Baru"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nama Bisnis / Instansi *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="CV Maju Jaya" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nama Kontak PIC *</label>
                  <input required type="text" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Budi Santoso" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nomor WhatsApp</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="628xxxxxxxxxx" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="klien@email.com" />
                </div>
              </div>

              <div className="border-t border-[var(--adm-border)] pt-5">
                <p className="text-xs font-bold text-[var(--adm-text-3)] uppercase tracking-wider mb-4">Info Website & Domain</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">URL Website</label>
                    <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="https://klien.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Status Website</label>
                    <select value={form.websiteStatus} onChange={e => setForm({ ...form, websiteStatus: e.target.value as "active" | "pending" | "down" })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <option value="active" className="bg-[var(--adm-card)]">Aktif</option>
                      <option value="pending" className="bg-[var(--adm-card)]">Pending</option>
                      <option value="down" className="bg-[var(--adm-card)]">Down</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Domain</label>
                    <input type="text" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="klien.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Kadaluarsa Domain</label>
                    <input type="date" value={form.domainExpiry} onChange={e => setForm({ ...form, domainExpiry: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Hosting</label>
                    <input type="text" value={form.hosting} onChange={e => setForm({ ...form, hosting: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Niagahoster / Hostinger / dll" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Kadaluarsa Hosting</label>
                    <input type="date" value={form.hostingExpiry} onChange={e => setForm({ ...form, hostingExpiry: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--adm-border)]">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-[var(--adm-text-2)] hover:bg-[var(--adm-bg)] transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--adm-accent)] text-white hover:opacity-90 transition-colors shadow-sm text-sm">{editingId ? "Simpan Perubahan" : "Tambah Klien"}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Client detail drawer */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 z-40"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--adm-card)] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--adm-border)]">
                <h2 className="text-base font-bold text-[var(--adm-text)]">{selectedClient.name}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(selectedClient)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  {deletingId === selectedClient.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(selectedClient.id)} className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus</button>
                      <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] font-bold bg-[var(--adm-bg)] text-[var(--adm-text)] rounded-lg hover:bg-[var(--adm-border)] transition-colors">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingId(selectedClient.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                  <button id="close-client-drawer" onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto h-full pb-20">
                <Section label="Kontak">
                  <Row label="Nama PIC" value={selectedClient.contact} />
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
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Hubungi via WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--adm-text-3)] mb-2">{label}</p>
      <div className="bg-[var(--adm-bg)] rounded-xl divide-y divide-[var(--adm-border)]">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-[var(--adm-text-2)]">{label}</span>
      <span className="text-xs font-medium text-[var(--adm-text)] text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

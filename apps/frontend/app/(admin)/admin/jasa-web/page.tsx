"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, Trash2, Pencil, X, Save, Check, ChevronDown } from "lucide-react";
import { PageHeader, AdminToast, AdminConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { pricingPlans as defaultPlans, modificationMenu as defaultMods } from "@/data/pricing";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  basicPrice: string;
  originalPrice?: string;
  promoBadge?: string;
  description: string;
  popular?: boolean;
  basicFeatures: PricingFeature[];
}

interface HandoverSimRow { label: string; value: string; total?: boolean; }
interface HandoverOption {
  title: string;
  desc: string;
  simulations: HandoverSimRow[];
  simNote: string;
}

interface ModItem { name: string; price: string; }
interface ModCategory { category: string; description: string; items: ModItem[]; }

// ─── Derived initial state from data/pricing.ts ────────────────────────────

const toHandoverOptions = (): HandoverOption[] => [
  {
    title: "Terima Beres (Basic)",
    desc: "Website di-hosting di server kami. Biaya mencakup perpanjangan sewa server dan domain. Revisi konten dikenakan biaya terpisah.",
    simulations: [
      { label: "Domain .my.id", value: "Rp 100rb/thn" },
      { label: "Domain .com", value: "Rp 300rb/thn" },
      { label: "Domain .co.id", value: "Rp 450rb/thn" },
    ],
    simNote: "*Harga perpanjangan mulai tahun ke-2"
  },
  {
    title: "Terima Beres (Plus)",
    desc: "Infrastruktur dikelola penuh. Sudah mencakup pemeliharaan server, keamanan, serta fasilitas gratis revisi minor 1x setiap bulannya.",
    simulations: [
      { label: "Maintenance", value: "Rp 600rb/thn" },
      { label: "+ Domain (.com)", value: "Rp 300rb/thn" },
      { label: "Total Estimasi", value: "Rp 900rb/thn", total: true },
    ],
    simNote: "*Tagihan pertama dimulai 3 bulan setelah rilis"
  },
  {
    title: "Sistem Mandiri",
    desc: "Kami menyerahkan source code mentah. Instalasi server, domain, dan pemeliharaan menjadi tanggung jawab Anda.",
    simulations: [
      { label: "Source Code", value: "Rp 0" },
      { label: "Maintenance", value: "Rp 0" },
      { label: "Total Tagihan", value: "Gratis", total: true },
    ],
    simNote: "*Bebas tagihan rutin dari kami. Server dikelola mandiri."
  }
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function JasaWebAdminPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"paket" | "serah" | "modifikasi">("paket");

  // Paket Harga
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Serah Terima
  const [handovers, setHandovers] = useState<HandoverOption[]>([]);
  const [editingHandoverIdx, setEditingHandoverIdx] = useState<number | null>(null);

  // Modifikasi
  const [mods, setMods] = useState<ModCategory[]>([]);
  const [editingMod, setEditingMod] = useState<{ catIdx: number; itemIdx: number | null } | null>(null);
  const [newModItem, setNewModItem] = useState<ModItem>({ name: "", price: "" });
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
    isVisible: false, message: "", type: "success"
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning" }>({
    isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger"
  });

  useEffect(() => {
    setIsClient(true);
    const savedPlans = localStorage.getItem("revtech_jasa_web_plans");
    const savedHandovers = localStorage.getItem("revtech_jasa_web_handovers");
    const savedMods = localStorage.getItem("revtech_modifications");

    setPlans(savedPlans
      ? JSON.parse(savedPlans)
      : defaultPlans.map(p => ({
          id: p.id,
          name: p.name,
          basicPrice: p.basicPrice,
          originalPrice: p.originalPrice,
          promoBadge: p.promoBadge,
          description: p.description,
          popular: p.popular,
          basicFeatures: p.basicFeatures,
        }))
    );

    setHandovers(savedHandovers ? JSON.parse(savedHandovers) : toHandoverOptions());
    setMods(savedMods ? JSON.parse(savedMods) : defaultMods.map(m => ({
      category: m.category,
      description: m.description,
      items: m.items.map(i => ({ name: i.name, price: i.price }))
    })));
  }, []);

  const savePlans = (newPlans: PricingPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem("revtech_jasa_web_plans", JSON.stringify(newPlans));
    window.dispatchEvent(new Event("jasa-web-updated"));
    setToast({ isVisible: true, message: "Harga paket berhasil disimpan", type: "success" });
    setEditingPlanId(null);
  };

  const saveHandovers = (newHandovers: HandoverOption[]) => {
    setHandovers(newHandovers);
    localStorage.setItem("revtech_jasa_web_handovers", JSON.stringify(newHandovers));
    window.dispatchEvent(new Event("jasa-web-updated"));
    setToast({ isVisible: true, message: "Opsi serah terima disimpan", type: "success" });
    setEditingHandoverIdx(null);
  };

  const saveMods = (newMods: ModCategory[]) => {
    setMods(newMods);
    localStorage.setItem("revtech_modifications", JSON.stringify(newMods));
    window.dispatchEvent(new Event("jasa-web-updated"));
    setToast({ isVisible: true, message: "Katalog modifikasi disimpan", type: "success" });
  };

  if (!isClient) return null;

  const editingPlan = plans.find(p => p.id === editingPlanId);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Jasa Web"
        description="Kelola harga paket jasa web, opsi serah terima, dan katalog modifikasi yang tampil di halaman publik."
        icon="language"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--adm-bg)] p-1 rounded-xl border border-[var(--adm-border)] w-fit">
        {([
          { key: "paket", label: "Paket Harga" },
          { key: "serah", label: "Opsi Serah Terima" },
          { key: "modifikasi", label: "Katalog Modifikasi" },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[var(--adm-accent)] text-white shadow-sm"
                : "text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: PAKET HARGA ──────────────────────────────────────────────── */}
      {activeTab === "paket" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border bg-[var(--adm-card)] flex flex-col gap-4 transition-all ${
                plan.popular ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-[var(--adm-border)]"
              }`}
            >
              {plan.popular && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full w-fit">
                  {plan.promoBadge || "BEST SELLER"}
                </span>
              )}
              <div>
                <h3 className="text-base font-bold text-[var(--adm-text)]">{plan.name}</h3>
                <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{plan.description}</p>
              </div>
              <div>
                {plan.originalPrice && (
                  <span className="text-xs text-[var(--adm-text-3)] line-through block">{plan.originalPrice}</span>
                )}
                <span className="text-2xl font-black text-[var(--adm-text)]">{plan.basicPrice}</span>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.basicFeatures.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs ${!f.included ? "opacity-40 line-through" : ""}`}>
                    <span className="material-symbols-outlined text-[14px] text-blue-500">
                      {f.included ? "check_circle" : "cancel"}
                    </span>
                    <span className="text-[var(--adm-text-2)]">{f.name}</span>
                  </li>
                ))}
              </ul>

              <Button onClick={() => setEditingPlanId(plan.id)} variant="outline" className="w-full gap-2 rounded-xl mt-auto">
                <Pencil size={14} /> Edit Harga
              </Button>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── TAB 2: OPSI SERAH TERIMA ───────────────────────────────────────── */}
      {activeTab === "serah" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-5">
          {handovers.map((opt, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] flex flex-col gap-4">
              <h3 className="text-base font-bold text-[var(--adm-text)]">{opt.title}</h3>
              <p className="text-xs text-[var(--adm-text-2)] leading-relaxed">{opt.desc}</p>

              <div className="bg-[var(--adm-bg)] rounded-xl p-4 border border-[var(--adm-border)] space-y-2">
                <p className="text-[10px] font-bold text-[var(--adm-text-3)] uppercase tracking-wide mb-2">Simulasi Biaya</p>
                {opt.simulations.map((sim, si) => (
                  <div key={si} className={`flex justify-between text-xs ${sim.total ? "pt-2 border-t border-[var(--adm-border)] font-bold text-[var(--adm-text)]" : "text-[var(--adm-text-2)]"}`}>
                    <span>{sim.label}</span>
                    <span className="font-semibold">{sim.value}</span>
                  </div>
                ))}
              </div>
              {opt.simNote && <p className="text-[11px] text-[var(--adm-text-3)]">{opt.simNote}</p>}

              <Button onClick={() => setEditingHandoverIdx(idx)} variant="outline" className="w-full gap-2 rounded-xl mt-auto">
                <Pencil size={14} /> Edit
              </Button>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── TAB 3: KATALOG MODIFIKASI ──────────────────────────────────────── */}
      {activeTab === "modifikasi" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {mods.map((cat, catIdx) => (
            <div key={catIdx} className="rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--adm-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--adm-text)]">{cat.category}</h3>
                  <p className="text-xs text-[var(--adm-text-3)]">{cat.description}</p>
                </div>
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: "Hapus Kategori",
                      message: `Hapus kategori "${cat.category}" beserta semua item di dalamnya?`,
                      confirmText: "Hapus",
                      confirmVariant: "danger",
                      action: () => {
                        const newMods = mods.filter((_, i) => i !== catIdx);
                        saveMods(newMods);
                      }
                    });
                  }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="divide-y divide-[var(--adm-border)]">
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="px-5 py-3 flex items-center gap-4 group hover:bg-[var(--adm-card-hover)] transition-colors">
                    {editingMod?.catIdx === catIdx && editingMod?.itemIdx === itemIdx ? (
                      <>
                        <input
                          value={item.name}
                          onChange={e => {
                            const newMods = [...mods];
                            newMods[catIdx].items[itemIdx].name = e.target.value;
                            setMods(newMods);
                          }}
                          className="flex-1 h-8 px-3 rounded-lg text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                        />
                        <input
                          value={item.price}
                          onChange={e => {
                            const newMods = [...mods];
                            newMods[catIdx].items[itemIdx].price = e.target.value;
                            setMods(newMods);
                          }}
                          className="w-36 h-8 px-3 rounded-lg text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                        />
                        <button onClick={() => { saveMods([...mods]); setEditingMod(null); }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingMod(null)} className="p-1.5 rounded-lg text-[var(--adm-text-3)] hover:bg-[var(--adm-bg)]">
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-[var(--adm-text)]">{item.name}</span>
                        <span className="text-sm font-bold text-[var(--adm-text)] whitespace-nowrap">{item.price}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingMod({ catIdx, itemIdx })} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "Hapus Item",
                                message: `Hapus item "${item.name}"?`,
                                confirmText: "Hapus",
                                confirmVariant: "danger",
                                action: () => {
                                  const newMods = [...mods];
                                  newMods[catIdx].items.splice(itemIdx, 1);
                                  saveMods(newMods);
                                }
                              });
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Item */}
              {editingMod?.catIdx === catIdx && editingMod?.itemIdx === null ? (
                <div className="px-5 py-3 border-t border-[var(--adm-border)] flex items-center gap-3">
                  <input
                    placeholder="Nama item..."
                    value={newModItem.name}
                    onChange={e => setNewModItem(p => ({ ...p, name: e.target.value }))}
                    className="flex-1 h-8 px-3 rounded-lg text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                  />
                  <input
                    placeholder="Harga..."
                    value={newModItem.price}
                    onChange={e => setNewModItem(p => ({ ...p, price: e.target.value }))}
                    className="w-36 h-8 px-3 rounded-lg text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!newModItem.name.trim()) return;
                      const newMods = [...mods];
                      newMods[catIdx].items.push({ ...newModItem });
                      saveMods(newMods);
                      setNewModItem({ name: "", price: "" });
                      setEditingMod(null);
                    }}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  >
                    <Check size={15} />
                  </button>
                  <button onClick={() => { setEditingMod(null); setNewModItem({ name: "", price: "" }); }} className="p-1.5 rounded-lg text-[var(--adm-text-3)] hover:bg-[var(--adm-bg)]">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="px-5 py-3 border-t border-[var(--adm-border)]">
                  <button
                    onClick={() => { setEditingMod({ catIdx, itemIdx: null }); setNewModItem({ name: "", price: "" }); }}
                    className="flex items-center gap-2 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus size={14} /> Tambah Item
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add New Category */}
          {showNewCat ? (
            <div className="p-5 rounded-2xl border border-dashed border-[var(--adm-border)] bg-[var(--adm-card)] flex items-center gap-3">
              <input
                placeholder="Nama kategori baru..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
              />
              <Button
                onClick={() => {
                  if (!newCatName.trim()) return;
                  const newMods = [...mods, { category: newCatName.trim(), description: "", items: [] }];
                  saveMods(newMods);
                  setNewCatName("");
                  setShowNewCat(false);
                }}
                className="gap-2 rounded-xl"
              >
                <Check size={15} /> Tambah
              </Button>
              <Button variant="outline" onClick={() => { setShowNewCat(false); setNewCatName(""); }} className="gap-2 rounded-xl">
                <X size={15} />
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowNewCat(true)} className="gap-2 rounded-xl w-full border-dashed">
              <Plus size={16} /> Tambah Kategori Baru
            </Button>
          )}
        </motion.div>
      )}

      {/* ── EDIT PLAN MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[var(--adm-card)] rounded-2xl shadow-2xl border border-[var(--adm-border)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--adm-border)]">
                <h2 className="font-bold text-[var(--adm-text)]">Edit Paket — {editingPlan.name}</h2>
                <button onClick={() => setEditingPlanId(null)} className="p-2 rounded-full hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)]">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {[
                  { label: "Nama Paket", key: "name" },
                  { label: "Harga Utama (basicPrice)", key: "basicPrice", placeholder: "Rp 499.000" },
                  { label: "Harga Coret / Promo (opsional)", key: "originalPrice", placeholder: "Rp 999.000" },
                  { label: "Badge Promo (opsional)", key: "promoBadge", placeholder: "TERLARIS" },
                  { label: "Deskripsi Singkat", key: "description" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={(editingPlan as any)[field.key] || ""}
                      onChange={e => {
                        const newPlans = plans.map(p =>
                          p.id === editingPlan.id ? { ...p, [field.key]: e.target.value } : p
                        );
                        setPlans(newPlans);
                      }}
                      className="w-full h-10 px-3 rounded-xl text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none transition-colors"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={editingPlan.popular || false}
                    onChange={e => {
                      const newPlans = plans.map(p =>
                        p.id === editingPlan.id ? { ...p, popular: e.target.checked } : p
                      );
                      setPlans(newPlans);
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="popular" className="text-sm font-semibold text-[var(--adm-text)]">Tandai sebagai Paket Populer (Best Seller)</label>
                </div>

                {/* Feature List */}
                <div>
                  <label className="text-xs font-bold text-[var(--adm-text-2)] mb-2 block">Fitur Paket</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editingPlan.basicFeatures.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={f.included}
                          onChange={e => {
                            const newPlans = plans.map(p => {
                              if (p.id !== editingPlan.id) return p;
                              const newFeatures = [...p.basicFeatures];
                              newFeatures[fi] = { ...newFeatures[fi], included: e.target.checked };
                              return { ...p, basicFeatures: newFeatures };
                            });
                            setPlans(newPlans);
                          }}
                          className="w-4 h-4 rounded shrink-0"
                        />
                        <input
                          value={f.name}
                          onChange={e => {
                            const newPlans = plans.map(p => {
                              if (p.id !== editingPlan.id) return p;
                              const newFeatures = [...p.basicFeatures];
                              newFeatures[fi] = { ...newFeatures[fi], name: e.target.value };
                              return { ...p, basicFeatures: newFeatures };
                            });
                            setPlans(newPlans);
                          }}
                          className="flex-1 h-8 px-2 rounded-lg text-xs bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[var(--adm-border)] flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingPlanId(null)} className="rounded-xl">Batal</Button>
                <Button onClick={() => savePlans(plans)} className="gap-2 rounded-xl">
                  <Save size={15} /> Simpan Perubahan
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT HANDOVER MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingHandoverIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[var(--adm-card)] rounded-2xl shadow-2xl border border-[var(--adm-border)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--adm-border)] shrink-0">
                <h2 className="font-bold text-[var(--adm-text)]">Edit Opsi Serah Terima</h2>
                <button onClick={() => setEditingHandoverIdx(null)} className="p-2 rounded-full hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)]">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {[
                  { label: "Judul", key: "title" },
                  { label: "Deskripsi", key: "desc" },
                  { label: "Catatan (simNote)", key: "simNote" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">{field.label}</label>
                    <input
                      type="text"
                      value={(handovers[editingHandoverIdx] as any)[field.key] || ""}
                      onChange={e => {
                        const newH = [...handovers];
                        (newH[editingHandoverIdx] as any)[field.key] = e.target.value;
                        setHandovers(newH);
                      }}
                      className="w-full h-10 px-3 rounded-xl text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-bold text-[var(--adm-text-2)] mb-2 block">Baris Simulasi Biaya</label>
                  <div className="space-y-2">
                    {handovers[editingHandoverIdx].simulations.map((sim, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <input
                          value={sim.label}
                          onChange={e => {
                            const newH = [...handovers];
                            newH[editingHandoverIdx].simulations[si].label = e.target.value;
                            setHandovers(newH);
                          }}
                          placeholder="Label"
                          className="flex-1 h-8 px-3 rounded-lg text-xs bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                        />
                        <input
                          value={sim.value}
                          onChange={e => {
                            const newH = [...handovers];
                            newH[editingHandoverIdx].simulations[si].value = e.target.value;
                            setHandovers(newH);
                          }}
                          placeholder="Nilai"
                          className="w-32 h-8 px-3 rounded-lg text-xs bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                        />
                        <input
                          type="checkbox"
                          title="Total row"
                          checked={sim.total || false}
                          onChange={e => {
                            const newH = [...handovers];
                            newH[editingHandoverIdx].simulations[si].total = e.target.checked;
                            setHandovers(newH);
                          }}
                          className="w-4 h-4"
                        />
                        <button
                          onClick={() => {
                            const newH = [...handovers];
                            newH[editingHandoverIdx].simulations.splice(si, 1);
                            setHandovers(newH);
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const newH = [...handovers];
                      newH[editingHandoverIdx].simulations.push({ label: "", value: "" });
                      setHandovers(newH);
                    }}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus size={13} /> Tambah Baris
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[var(--adm-border)] flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setEditingHandoverIdx(null)} className="rounded-xl">Batal</Button>
                <Button onClick={() => saveHandovers(handovers)} className="gap-2 rounded-xl">
                  <Save size={15} /> Simpan
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => { confirmModal.action(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
      />
      <AdminToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

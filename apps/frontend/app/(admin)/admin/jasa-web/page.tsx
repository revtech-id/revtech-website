"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, Trash2, Pencil, X, Save, Check, ChevronDown, Package, FileText, Wrench } from "lucide-react";
import { PageHeader, AdminToast, AdminConfirmModal, AdminModal, AdminButton } from "@/components/admin/ui";

import { pricingPlans as defaultPlans, modificationMenu as defaultMods } from "@/data/pricing";
import { calculateDiscount } from "@/lib/utils";

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
  fullFeatures?: PricingFeature[];
  demoLink?: string;
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

// ─── Components ──────────────────────────────────────────────────────────────

function PricingCard({ plan, onEdit }: { plan: PricingPlan; onEdit: () => void }) {
  return (
    <div
      className={`p-6 rounded-2xl border bg-[var(--adm-card)] flex flex-col gap-4 transition-all ${
        plan.popular ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-[var(--adm-border)]"
      }`}
    >
      {plan.popular && (
        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-3 py-1 rounded-full w-fit">
          BEST SELLER
        </span>
      )}
      <div>
        <h3 className="text-base font-bold text-[var(--adm-text)]">{plan.name}</h3>
        <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{plan.description}</p>
      </div>
      <div>
        {plan.originalPrice && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[var(--adm-text-3)] line-through block">{plan.originalPrice}</span>
            {(() => {
              const discount = calculateDiscount(plan.basicPrice, plan.originalPrice);
              return discount ? (
                <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {discount}
                </span>
              ) : null;
            })()}
          </div>
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

      <AdminButton onClick={onEdit} variant="outline" className="w-full gap-2 rounded-xl mt-auto">
        <Pencil size={14} /> Edit
      </AdminButton>
    </div>
  );
}

function HandoverCard({ opt, onEdit }: { opt: HandoverOption; onEdit: () => void }) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] flex flex-col gap-4">
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

      <AdminButton onClick={onEdit} variant="outline" className="w-full gap-2 rounded-xl mt-auto">
        <Pencil size={14} /> Edit
      </AdminButton>
    </div>
  );
}

// ─── Derived initial state ────────────────────────────────────────────────────

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

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [handovers, setHandovers] = useState<HandoverOption[]>([]);
  const [editingHandoverIdx, setEditingHandoverIdx] = useState<number | null>(null);

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

    if (savedPlans) {
      const parsedPlans: PricingPlan[] = JSON.parse(savedPlans);
      setPlans(parsedPlans.map(p => ({
        ...p,
        fullFeatures: p.fullFeatures || [],
        demoLink: p.demoLink || ""
      })));
    } else {
      setPlans(defaultPlans.map(p => ({
        id: p.id,
        name: p.name,
        basicPrice: p.basicPrice,
        originalPrice: p.originalPrice,
        promoBadge: p.promoBadge,
        description: p.description,
        popular: p.popular,
        basicFeatures: p.basicFeatures,
        fullFeatures: p.fullFeatures || [],
        demoLink: "",
      })));
    }

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
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--adm-bg)] p-1.5 rounded-2xl border border-[var(--adm-border)] w-fit">
        {([
          { key: "paket", label: "Kelola Paket" },
          { key: "serah", label: "Opsi Serah Terima" },
          { key: "modifikasi", label: "Katalog Modifikasi" },
        ] as const).map(tab => {
          const isActive = activeTab === tab.key;
          return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? "bg-[var(--adm-card)] shadow-sm text-[var(--adm-text)]"
                : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-card)]/40"
            }`}
          >
            {tab.label}
          </button>
        )})}
      </div>

      {/* ── TAB 1: PAKET HARGA ──────────────────────────────────────────────── */}
      {activeTab === "paket" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PricingCard key={plan.id} plan={plan} onEdit={() => setEditingPlanId(plan.id)} />
          ))}
        </motion.div>
      )}

      {/* ── TAB 2: OPSI SERAH TERIMA ───────────────────────────────────────── */}
      {activeTab === "serah" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-5">
          {handovers.map((opt, idx) => (
            <HandoverCard key={idx} opt={opt} onEdit={() => setEditingHandoverIdx(idx)} />
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
                  className="p-1.5 text-[var(--adm-text-3)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
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
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                          <button onClick={() => setEditingMod({ catIdx, itemIdx })} className="p-1 text-[var(--adm-text-3)] hover:text-white transition-colors">
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
                            className="p-1 text-[var(--adm-text-3)] hover:text-red-500 transition-colors"
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
                    className="flex items-center gap-2 text-xs font-semibold text-[var(--adm-accent)] hover:brightness-110 transition-colors"
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
              <AdminButton
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
              </AdminButton>
              <AdminButton variant="outline" onClick={() => { setShowNewCat(false); setNewCatName(""); }} className="gap-2 rounded-xl">
                <X size={15} />
              </AdminButton>
            </div>
          ) : (
            <AdminButton variant="outline" onClick={() => setShowNewCat(true)} className="gap-2 rounded-xl w-full border-dashed">
              <Plus size={16} /> Tambah Kategori Baru
            </AdminButton>
          )}
        </motion.div>
      )}

      {/* ── EDIT PLAN MODAL ──────────────────────────────────────────────────── */}
      <AdminModal isOpen={!!editingPlan} onClose={() => setEditingPlanId(null)} maxWidth="max-w-4xl" noPadding={true}>
        {editingPlan && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--adm-border)] shrink-0">
              <h2 className="font-bold text-[var(--adm-text)]">Edit Paket — {editingPlan.name}</h2>
              <button onClick={() => setEditingPlanId(null)} className="p-2 rounded-full hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-8 flex-1 overflow-y-auto admin-scrollbar">
              {/* Left Column: Details */}
              <div className="space-y-4">
                {[
                  { label: "Nama Paket", key: "name" },
                  { label: "Harga Utama (basicPrice)", key: "basicPrice", placeholder: "Rp 499.000" },
                  { label: "Harga Coret / Promo (opsional)", key: "originalPrice", placeholder: "Rp 999.000" },
                  { label: "Deskripsi Singkat", key: "description" },
                  { label: "Link Live Demo (opsional)", key: "demoLink", placeholder: "https://contoh.com" },
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
                      const isChecked = e.target.checked;
                      const newPlans = plans.map(p =>
                        p.id === editingPlan.id 
                          ? { ...p, popular: isChecked } 
                          // If checking this plan, remove popular from all others.
                          // If unchecking, leave others as they are (none popular).
                          : (isChecked ? { ...p, popular: false } : p)
                      );
                      setPlans(newPlans);
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="popular" className="text-sm font-semibold text-[var(--adm-text)]">Tandai sebagai Paket Populer (Best Seller)</label>
                </div>
              </div>

              {/* Right Column: Feature List */}
              <div className="flex flex-col h-full">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-2 block">Fitur Singkat (Card)</label>
                    <div className="space-y-2">
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
                          <button
                            onClick={() => {
                              const newPlans = plans.map(p => {
                                if (p.id !== editingPlan.id) return p;
                                const newFeatures = [...p.basicFeatures];
                                newFeatures.splice(fi, 1);
                                return { ...p, basicFeatures: newFeatures };
                              });
                              setPlans(newPlans);
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newPlans = plans.map(p => p.id === editingPlan.id ? { ...p, basicFeatures: [...p.basicFeatures, { name: "", included: true }] } : p);
                        setPlans(newPlans);
                      }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--adm-accent)] hover:brightness-110 transition-colors"
                    >
                      <Plus size={13} /> Tambah Fitur Singkat
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-2 block">Daftar Spesifikasi & Fitur Teknis (Modal Lengkap)</label>
                    <div className="space-y-2">
                      {editingPlan.fullFeatures?.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={f.included}
                            onChange={e => {
                              const newPlans = plans.map(p => {
                                if (p.id !== editingPlan.id) return p;
                                const newFeatures = [...(p.fullFeatures || [])];
                                newFeatures[fi] = { ...newFeatures[fi], included: e.target.checked };
                                return { ...p, fullFeatures: newFeatures };
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
                                const newFeatures = [...(p.fullFeatures || [])];
                                newFeatures[fi] = { ...newFeatures[fi], name: e.target.value };
                                return { ...p, fullFeatures: newFeatures };
                              });
                              setPlans(newPlans);
                            }}
                            className="flex-1 h-8 px-2 rounded-lg text-xs bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none"
                          />
                          <button
                            onClick={() => {
                              const newPlans = plans.map(p => {
                                if (p.id !== editingPlan.id) return p;
                                const newFeatures = [...(p.fullFeatures || [])];
                                newFeatures.splice(fi, 1);
                                return { ...p, fullFeatures: newFeatures };
                              });
                              setPlans(newPlans);
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newPlans = plans.map(p => p.id === editingPlan.id ? { ...p, fullFeatures: [...(p.fullFeatures || []), { name: "", included: true }] } : p);
                        setPlans(newPlans);
                      }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--adm-accent)] hover:brightness-110 transition-colors"
                    >
                      <Plus size={13} /> Tambah Spesifikasi
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--adm-border)] flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditingPlanId(null)} className="text-sm font-semibold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors px-3">
                Batal
              </button>
              <AdminButton onClick={() => savePlans(plans)} className="gap-2 rounded-xl">
                <Save size={15} /> Simpan Perubahan
              </AdminButton>
            </div>
          </>
        )}
      </AdminModal>

      {/* ── EDIT HANDOVER MODAL ──────────────────────────────────────────────── */}
      <AdminModal isOpen={editingHandoverIdx !== null} onClose={() => setEditingHandoverIdx(null)} maxWidth="max-w-lg" noPadding={true}>
        {editingHandoverIdx !== null && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--adm-border)] shrink-0">
              <h2 className="font-bold text-[var(--adm-text)]">Edit Opsi Serah Terima</h2>
              <button onClick={() => setEditingHandoverIdx(null)} className="p-2 rounded-full hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 admin-scrollbar">
              {[
                { label: "Judul", key: "title" },
                { label: "Deskripsi", key: "desc" },
                { label: "Catatan (simNote)", key: "simNote" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">{field.label}</label>
                  {field.key === 'desc' ? (
                    <textarea
                      rows={2}
                      value={(handovers[editingHandoverIdx] as any)[field.key] || ""}
                      onChange={e => {
                        const newH = [...handovers];
                        (newH[editingHandoverIdx] as any)[field.key] = e.target.value;
                        setHandovers(newH);
                      }}
                      className="w-full p-3 rounded-xl text-sm bg-[var(--adm-bg)] border border-[var(--adm-border)] text-[var(--adm-text)] focus:border-[var(--adm-accent)] outline-none resize-y"
                    />
                  ) : (
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
                  )}
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
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--adm-accent)] hover:brightness-110 transition-colors"
                >
                  <Plus size={13} /> Tambah Baris
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--adm-border)] flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditingHandoverIdx(null)} className="text-sm font-semibold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors px-3">
                Batal
              </button>
              <AdminButton onClick={() => saveHandovers(handovers)} className="gap-2 rounded-xl">
                <Save size={15} /> Simpan
              </AdminButton>
            </div>
          </>
        )}
      </AdminModal>

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

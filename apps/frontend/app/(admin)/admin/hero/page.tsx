"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileUp, Save, Monitor, Tablet, Smartphone } from "lucide-react";
import { AdminToast, AdminButton } from "@/components/admin/ui";

type DeviceKey = "desktop" | "tablet" | "mobile";
type MediaSlot = { bgMedia: string; bgType: "image" | "video" };

interface HeroSettings {
  desktop: MediaSlot;
  tablet: MediaSlot;
  mobile: MediaSlot;
}

const EMPTY_SLOT: MediaSlot = { bgMedia: "", bgType: "image" };

const DEFAULT_SETTINGS: HeroSettings = {
  desktop: { ...EMPTY_SLOT },
  tablet:  { ...EMPTY_SLOT },
  mobile:  { ...EMPTY_SLOT },
};

const DEVICES: { key: DeviceKey; label: string; icon: React.ReactNode; hint: string; iframeW: number }[] = [
  { key: "desktop", label: "Laptop", icon: <Monitor size={14} />,    hint: "1280px", iframeW: 1280 },
  { key: "tablet",  label: "Tablet", icon: <Tablet size={14} />,     hint: "768px",  iframeW: 768  },
  { key: "mobile",  label: "Mobile", icon: <Smartphone size={14} />, hint: "390px",  iframeW: 390  },
];

export default function HeroBannerPage() {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);
  const [activeDevice, setActiveDevice] = useState<DeviceKey>("desktop");
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
    isVisible: false, message: "", type: "success",
  });
  const [containerW, setContainerW] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef    = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;

      // Prevent navigation in iframe
      doc.addEventListener("click", (e: Event) => {
        const anchor = (e.target as Element)?.closest("a[href]");
        if (anchor) e.preventDefault();
      }, true);

      doc.addEventListener("submit", (e: Event) => e.preventDefault(), true);
    } catch { /* cross-origin guard */ }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    setContainerW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_hero_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bgMedia !== undefined || !parsed.desktop) {
          setSettings(DEFAULT_SETTINGS);
        } else {
          setSettings({
            desktop: parsed.desktop ?? EMPTY_SLOT,
            tablet:  parsed.tablet  ?? EMPTY_SLOT,
            mobile:  parsed.mobile  ?? EMPTY_SLOT,
          });
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("revtech_hero_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("hero-settings-updated"));
    iframeRef.current?.contentWindow?.dispatchEvent(new Event("hero-settings-updated"));
    setToast({ isVisible: true, message: "Hero Banner berhasil disimpan", type: "success" });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("revtech_hero_settings", JSON.stringify(DEFAULT_SETTINGS));
    if (iframeRef.current) iframeRef.current.src = "/";
    setToast({ isVisible: true, message: "Dikembalikan ke pengaturan default", type: "success" });
  };

  const handleFile = useCallback((device: DeviceKey, file: File | undefined) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const reader = new FileReader();
    reader.onloadend = () => {
      const newSlot = { bgMedia: reader.result as string, bgType: isVideo ? "video" : "image" } as const;
      setSettings((prev) => {
        const next = { ...prev, [device]: newSlot };
        localStorage.setItem("revtech_hero_settings", JSON.stringify(next));
        return next;
      });
      if (iframeRef.current) iframeRef.current.src = "/";
      setToast({
        isVisible: true,
        message: `${isVideo ? "Video" : "Gambar"} ${DEVICES.find(d => d.key === device)?.label} berhasil diunggah`,
        type: "success",
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const activeDeviceCfg = DEVICES.find(d => d.key === activeDevice)!;
  
  // Lock desktop size to 1280x800 for the perfect screenshot-like layout
  const iframeW = activeDevice === "desktop" ? 1280 : activeDeviceCfg.iframeW;
  const zoom    = containerW > 0 ? containerW / iframeW : 1;
  const iframeH = activeDevice === "desktop" ? 800 : activeDevice === "mobile" ? 740 : 650;
  const boxH    = Math.round(iframeH * zoom);

  if (!isClient) return null;

  return (
    <div className="space-y-4 pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Device Tabs with inline upload */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--adm-card)] border border-[var(--adm-border)]">
          {DEVICES.map((d) => {
            const slot = settings[d.key] ?? EMPTY_SLOT;
            return (
              <div key={d.key} className="flex items-center">
                <button
                  onClick={() => setActiveDevice(d.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeDevice === d.key
                      ? "bg-[var(--adm-bg)] text-[var(--adm-text)] shadow-sm"
                      : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"
                  }`}
                >
                  {d.icon} {d.label}
                  {slot.bgMedia && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--adm-success)] ml-0.5" />
                  )}
                </button>
                <label
                  className="p-1 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors cursor-pointer"
                  title={`Upload background ${d.label}`}
                >
                  <FileUp size={11} />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleFile(d.key, e.target.files?.[0])}
                  />
                </label>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <AdminButton onClick={handleReset} variant="ghost" size="sm">
            Reset
          </AdminButton>
          <AdminButton onClick={handleSave} icon={<Save size={14} />}>
            Simpan
          </AdminButton>
        </div>
      </div>

      {/* Preview — interactive iframe */}
      <div ref={containerRef} className="w-full">
        <div
          className={`relative overflow-hidden bg-white ${
            activeDevice === "desktop"
              ? ""
              : "rounded-xl border border-[var(--adm-border)]"
          }`}
          style={{ height: boxH }}
        >
          <iframe
            ref={iframeRef}
            src="/"
            title="Hero Preview"
            scrolling="no"
            onLoad={handleIframeLoad}
            style={{
              width:   iframeW,
              height:  iframeH,
              border:  "none",
              display: "block",
              zoom:    zoom,
            }}
          />
        </div>
        <p className="text-xs text-[var(--adm-text-3)] mt-2">
          *Preview interaktif. Klik tombol, FAB, dan navbar berfungsi.
        </p>
      </div>

      <AdminToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

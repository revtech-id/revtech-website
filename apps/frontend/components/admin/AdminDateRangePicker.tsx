"use client";

import { useState } from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";

export function AdminDateRangePicker() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("thisMonth");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-25");
  const [dateDisplay, setDateDisplay] = useState("01.07.2026 - 25.07.2026");

  const formatDateStr = (dStr: string) => {
    const d = new Date(dStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleSelect = (id: string, start: string, end: string) => {
    setPreset(id);
    setShowCustom(false);
    setStartDate(start);
    setEndDate(end);
    setDateDisplay(`${formatDateStr(start)} - ${formatDateStr(end)}`);
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      setPreset("custom");
      setDateDisplay(`${formatDateStr(startDate)} - ${formatDateStr(endDate)}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Mini Pill Trigger */}
      <button
        id="topbar-date-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-tight transition-all border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
        style={{
          background: "var(--adm-card)",
          color: "var(--adm-text-2)",
        }}
      >
        <span className="font-mono text-[9.5px] opacity-85">{dateDisplay}</span>
        <Calendar className="h-3 w-3 opacity-60 shrink-0" style={{ color: "var(--adm-text-2)" }} />
      </button>

      {/* Popover Card */}
      {open && (
        <div
          style={{
            background: "var(--adm-card)",
            border: "1px solid var(--adm-border)",
            boxShadow: "0 14px 36px rgba(0,0,0,0.18)",
          }}
          className="absolute left-0 top-full mt-2 w-64 z-50 rounded-2xl p-2 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {[
            { id: "today", text: "Hari Ini", start: "2026-07-25", end: "2026-07-25" },
            { id: "7days", text: "7 Hari Terakhir", start: "2026-07-18", end: "2026-07-25" },
            { id: "30days", text: "30 Hari Terakhir", start: "2026-06-25", end: "2026-07-25" },
            { id: "thisMonth", text: "Bulan Ini", start: "2026-07-01", end: "2026-07-25" },
            { id: "thisYear", text: "Tahun Ini", start: "2026-01-01", end: "2026-07-25" },
          ].map((item) => {
            const isSelected = preset === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id, item.start, item.end)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all text-left ${
                  isSelected
                    ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10"
                    : "font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <span>{item.text}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            );
          })}

          <button
            onClick={() => setShowCustom((c) => !c)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all text-left ${
              preset === "custom"
                ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10"
                : "font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            }`}
          >
            <span>Kustom...</span>
            <ChevronDown
              className="h-3 w-3 shrink-0 opacity-60 transition-transform duration-200"
              style={{ transform: showCustom ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {showCustom && (
            <div className="p-2 space-y-2 pt-2 border-t mt-1" style={{ borderColor: "var(--adm-border)" }}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold block mb-1 opacity-70" style={{ color: "var(--adm-text-3)" }}>
                    Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-xl text-[11px] font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ color: "var(--adm-text)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1 opacity-70" style={{ color: "var(--adm-text-3)" }}>
                    Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1 rounded-xl text-[11px] font-mono border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ color: "var(--adm-text)" }}
                  />
                </div>
              </div>
              <button
                onClick={handleApplyCustom}
                className="w-full py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 transition-all shadow-xs"
              >
                Terapkan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

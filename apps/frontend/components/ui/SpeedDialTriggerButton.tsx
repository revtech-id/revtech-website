"use client";

export function SpeedDialTriggerButton() {
  return (
    <button 
        onClick={() => window.dispatchEvent(new CustomEvent("open-speed-dial"))}
        className="w-full sm:w-auto bg-white text-blue-950 hover:bg-blue-50 font-black text-base px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] hover-btn inline-flex items-center justify-center gap-2 relative z-20"
    >
        <span className="material-symbols-outlined text-[20px]">forum</span> Konsultasi Kebutuhan Anda
    </button>
  );
}

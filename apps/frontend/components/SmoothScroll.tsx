"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect prefers-reduced-motion — skip Lenis entirely untuk aksesibilitas
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      // lerp: interpolasi linear yang menentukan "berat" scroll
      // 0.08 = Apple-style: smooth tapi responsif, tidak terlalu mengambang
      lerp: 0.08,
      // syncToNative: true pada touch = gunakan scroll native di mobile
      // Ini penting agar mobile tidak terasa lambat/laggy
      syncTouch: typeof window !== 'undefined' && 'ontouchstart' in window,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // infinite: false agar tidak ada edge case di halaman biasa
      infinite: false,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      // CRITICAL: cancel RAF sebelum destroy untuk mencegah memory leak
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

"use client";
import { useEffect } from "react";

/**
 * Loads Material Symbols Outlined asynchronously after hydration
 * to avoid render-blocking. Icons appear slightly after initial paint
 * but do not block LCP or FCP.
 */
export default function MaterialSymbols() {
  useEffect(() => {
    const existing = document.querySelector('link[data-material-symbols]');
    if (existing) return; // already loaded

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("data-material-symbols", "true");
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    document.head.appendChild(link);
  }, []);

  return null;
}

import { Variants } from 'framer-motion';

/**
 * Spring config presets — tuned untuk feel Apple/Vercel.
 * Hanya animasikan transform & opacity untuk 60 FPS.
 */
const spring = {
  smooth: { type: 'spring', stiffness: 80, damping: 20, mass: 0.8 },
  snappy: { type: 'spring', stiffness: 200, damping: 30, mass: 0.5 },
  gentle: { type: 'spring', stiffness: 60, damping: 18, mass: 1 },
} as const;

/**
 * Fade up — animasi masuk standar untuk section headings & content blocks.
 * Jangan set willChange di sini — Framer Motion manage sendiri via layoutId.
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring.smooth,
  },
};

/**
 * Fade in tanpa vertical movement — untuk elemen overlay, badge, subtitle.
 */
export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: 'tween', duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};



/**
 * Stagger container — untuk list items yang muncul berurutan.
 * Amount stagger 0.08s adalah sweet-spot: cukup terlihat tapi tidak lambat.
 */
export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};



/**
 * Viewport config standar — `once: true` agar animasi tidak retrigger
 * saat scroll balik ke atas. `amount: 0.15` lebih presisi dari 0.1.
 */
export const defaultViewport = {
  once: true,
  amount: 0.02,
} as const;

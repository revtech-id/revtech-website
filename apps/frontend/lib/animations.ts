import { Variants } from 'framer-motion';

/**
 * Standard fade-up animation for scroll entrances.
 * Uses spring physics for an organic, elegant feel.
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40, willChange: "transform, opacity" },
  visible: { 
    opacity: 1, 
    y: 0, 
    willChange: "auto",
    transition: { type: "tween", duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

/**
 * Staggered container for lists of items to appear one by one.
 */
export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

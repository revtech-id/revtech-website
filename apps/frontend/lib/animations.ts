import { Variants } from 'framer-motion';

/**
 * Standard fade-up animation for scroll entrances.
 * Uses spring physics for an organic, elegant feel.
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "tween", duration: 0.4, ease: "easeOut" }
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

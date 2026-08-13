"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
  maxWidth?: string; // e.g. "max-w-md", "max-w-2xl"
  noPadding?: boolean;
}

export function AdminModal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-md", noPadding = false }: AdminModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`bg-[var(--adm-card)] rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col ${noPadding ? 'overflow-hidden' : 'p-6 overflow-y-auto'} ${maxWidth}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="mb-6">
                <h3 className="font-bold text-lg text-[var(--adm-text)]">{title}</h3>
                {subtitle && <p className="text-sm text-[var(--adm-text-3)] mt-0.5">{subtitle}</p>}
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

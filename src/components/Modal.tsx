'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: ModalProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Animated Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} my-8 rounded-2xl border border-border/80 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between border-b border-border/70 pb-4 mb-4">
                <div>
                  {title && <h2 className="text-lg font-bold font-display text-foreground tracking-tight">{title}</h2>}
                  {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition ml-4 shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

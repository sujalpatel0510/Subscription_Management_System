'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Page Transition wrapper for tab views
export function PageTransition({
  children,
  currentKey,
}: {
  children: React.ReactNode;
  currentKey: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered Container for Metric Cards and Grids
export function StaggerContainer({
  children,
  className = '',
  delay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item
export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated Numerical Counter (Linear/Fintech style)
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [value, duration, shouldReduceMotion]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className="tabular-nums font-mono">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// Spotlight Card: subtle mouse cursor-following ambient glow (Linear/Raycast aesthetic)
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(99, 102, 241, 0.12)',
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// Scale Button for press and hover feedback
export function ScaleButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  title,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

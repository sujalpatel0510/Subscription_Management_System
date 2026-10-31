'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('brightloop_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('brightloop_theme', 'light');
      }
    } catch (_) {}
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground ${className}`}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  CreditCard,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  ExternalLink,
  Laptop,
  Flame,
  Globe,
  Sliders,
  Users,
  Check,
  TrendingUp,
  Receipt,
  Server,
  Activity,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { TabId } from './Sidebar';

interface LandingPageProps {
  onEnterApp: (tab?: TabId) => void;
  plans?: any[];
}

export default function LandingPage({ onEnterApp, plans = [] }: LandingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'billing' | 'lifecycle'>('overview');

  // Interactive Glass Navbar & Scroll State
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'preview' | 'features' | 'pricing' | 'architecture' | 'faq'>('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / winHeight) * 100)));
      }

      // Check sections from bottom to top for accurate scroll tracking
      const sections = [
        { id: 'faq', threshold: 280 },
        { id: 'architecture', threshold: 280 },
        { id: 'pricing', threshold: 280 },
        { id: 'features', threshold: 280 },
        { id: 'preview', threshold: 280 },
      ] as const;

      let currentFound = false;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= sec.threshold && rect.bottom >= 100) {
            setActiveSection(sec.id);
            currentFound = true;
            break;
          }
        }
      }

      if (!currentFound && scrollY < 400) {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'preview', label: 'Live Interface', badge: 'Interactive Preview' },
    { id: 'features', label: 'Platform Features', badge: '6 Core Engines' },
    { id: 'pricing', label: 'Pricing Cadence', badge: 'Flexible Plans' },
    { id: 'architecture', label: 'Database Engine', badge: 'PostgreSQL 18.x' },
    { id: 'faq', label: 'FAQ', badge: 'Enterprise Specs' },
  ];

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('hero');
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId as any);
    }
  };

  const getSectionLabel = () => {
    switch (activeSection) {
      case 'preview':
        return `Live Interface (${activePreviewTab === 'overview' ? 'Overview' : activePreviewTab === 'billing' ? 'Billing Engine' : 'Lifecycle'})`;
      case 'features':
        return 'Platform Features';
      case 'pricing':
        return `Pricing (${billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'})`;
      case 'architecture':
        return 'Database Architecture';
      case 'faq':
        return 'Frequently Asked Questions';
      default:
        return 'Brightloop 2.0 Engine';
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const defaultPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      targetTab: 'plans' as TabId,
      priceMonthly: 29,
      priceYearly: 290,
      description: 'Ideal for early-stage SaaS startups orchestrating initial customer recurring billing.',
      badge: 'Seed & Early Stage',
      features: [
        'Up to 1,000 Active Subscriptions',
        'Deterministic Daily Invoicing Runs',
        'Stripe, Card & Bank Reconciliation',
        'Customer Isolation Self-Service Portal',
        'Standard Email Notifications',
        'Automated Tax Calculations (GST/VAT)',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Professional Scale',
      targetTab: 'plans' as TabId,
      priceMonthly: 99,
      priceYearly: 990,
      description: 'For scaling B2B platforms requiring dynamic pricing tiers and differential add-ons.',
      badge: 'Most Popular',
      features: [
        'Up to 10,000 Active Subscriptions',
        'Odoo & Enterprise Variant Pricing (+$560)',
        'Full Subscription Lifecycle (Pause / Resume / Close)',
        'Multi-Currency & Automated Regional Rules',
        'Granular RBAC Security (Admin, Staff, Customer)',
        'Real-time AR Aging & Churn Intelligence',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Monolith',
      targetTab: 'plans' as TabId,
      priceMonthly: 299,
      priceYearly: 2990,
      description: 'High-volume recurring commerce powered by PostgreSQL 18.x atomic ACID guarantees.',
      badge: 'Uncompromising Scale',
      features: [
        'Unlimited Subscriptions & Invoices',
        'Custom Quotation Workflow Engine',
        'Zero-Duplicate Idempotency Guarantees',
        'Audit-Trailed Payment Voiding & Recalculation',
        'Direct PostgreSQL Local & Cloud Connection',
        '24/7 Priority SLA & Dedicated Monolith Support',
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How does Brightloop guarantee zero duplicate invoices during recurring billing?',
      a: 'Brightloop enforces database-level unique compound constraints on [subscriptionId, periodStart, periodEnd] backed by atomic transactions. Even if a billing batch is executed concurrently or retried after network interruption, the database strictly prevents duplicate invoices.',
    },
    {
      q: 'How can I connect my existing local PostgreSQL 17/18 database?',
      a: 'Brightloop is engineered database-first. Simply run `npm run db:connect <your_postgres_password>` from your terminal. The CLI utility automatically configures your credentials, applies Prisma migrations, seeds default accounts, and tests live connection with zero code modifications.',
    },
    {
      q: 'How does variant pricing (like Odoo brand add-on +$560.00) work?',
      a: 'Products in Brightloop support customizable variant attributes (e.g. Attribute="Brand", Value="Odoo"). Each variant carries a configurable price adjustment delta that automatically cascades to quotation line items and recurring billing invoices while keeping cost prices protected.',
    },
    {
      q: 'What role-based security policies (RBAC) are enforced?',
      a: 'Brightloop implements strict multi-role authorization: ADMIN has unrestricted privileges; STAFF can manage day-to-day operations (invoices, subscriptions, payments) but is strictly forbidden from creating discounts or inviting staff; and CUSTOMER users are strictly isolated to viewing only their own subscriptions and invoices.',
    },
    {
      q: 'What happens when a recorded payment is voided?',
      a: 'Voiding a payment triggers an atomic database transaction that updates the payment record to VOIDED, records the mandatory audit reason, and automatically recalculates the amount paid and status (e.g. PARTIALLY_PAID or CONFIRMED) on all associated invoices.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground flex flex-col">
      {/* 1. INTERACTIVE FROSTED GLASS TOP NAVIGATION (FIXED AT TOP - NEVER SCROLLS AWAY) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 dark:bg-card/90 backdrop-blur-2xl border-b border-border/80 shadow-md shadow-black/5 dark:shadow-black/25 py-2.5'
            : 'bg-background/70 dark:bg-background/60 backdrop-blur-md border-b border-border/40 py-3.5'
        }`}
      >
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-8">
          {/* Brand Logo & Dynamic Context Pill */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => onEnterApp('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Brightloop
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold -mt-1">
                  Subscription Engine
                </span>
              </div>
            </div>

            {/* Dynamic Active Context Pill (changes when user scrolls or switches content) */}
            <div className="hidden xl:inline-flex items-center gap-2 rounded-full border border-border/80 bg-accent/40 backdrop-blur-md px-3 py-1 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">
                Viewing: <strong className="text-foreground font-semibold">{getSectionLabel()}</strong>
              </span>
            </div>
          </div>

          {/* Center Navigation Links with Active State Indicator */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full border border-border/50 bg-accent/25 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30 scale-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 font-semibold'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/90 animate-pulse" />
                  )}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={() => onEnterApp('dashboard')}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-card/60 backdrop-blur-md text-foreground hover:bg-accent transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Top Reading Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Mobile Dropdown Menu with Frosted Glass */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-background/95 dark:bg-card/95 backdrop-blur-2xl p-4 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-2 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Jump to Section</span>
            </div>
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/25 font-bold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.badge}</span>
                </a>
              );
            })}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => onEnterApp('dashboard')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition"
              >
                <span>Launch Application Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. FULL-SCREEN HERO SECTION */}
      <section id="hero" className="relative w-full pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 text-center relative z-10">
          {/* Subtitle Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-in fade-in duration-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Brightloop 2.0 • PostgreSQL 18.x Database-First Monolith</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-5xl mx-auto leading-tight sm:leading-none">
            The Modern <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Subscription Management</span> & Invoicing Engine
          </h1>

          {/* Description */}
          <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Automate end-to-end subscription lifecycles, variant pricing adjustments, idempotent recurring billing runs, multi-invoice payment reconciliation, and real-time revenue analytics.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition active:scale-95"
            >
              <span>Launch Application Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onEnterApp('subscriptions')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition active:scale-95"
            >
              <Layers className="h-4 w-4 text-primary" />
              <span>Explore Subscriptions</span>
            </button>
          </div>

          {/* High-Impact Stat Strip */}
          <div className="mt-16 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">$14.8M+</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Processed Annual MRR</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">99.99%</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Billing Idempotency</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">&lt; 10ms</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Core Query Latency</div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-primary font-mono">100%</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Immutable Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE PRODUCT DEMO / PREVIEW */}
      <section id="preview" className="py-16 w-full bg-muted/20 border-y border-border">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Experience</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
                Executive Control Center
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time visibility into MRR run-rate, subscriber health, overdue receivables, and automated billing.
              </p>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm shrink-0">
              <button
                onClick={() => setActivePreviewTab('overview')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activePreviewTab === 'overview'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActivePreviewTab('billing')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activePreviewTab === 'billing'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Billing Schedule
              </button>
              <button
                onClick={() => setActivePreviewTab('lifecycle')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activePreviewTab === 'lifecycle'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lifecycle Controls
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div
            onClick={() => onEnterApp('dashboard')}
            className="group cursor-pointer rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-2xl transition hover:border-primary/50 hover:shadow-primary/10 relative overflow-hidden"
          >
            <div className="absolute top-4 right-5 z-20 flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition">
              <span>Open in Full App</span>
              <ExternalLink className="h-3 w-3" />
            </div>

            {/* Fake Window Controls */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">brightloop.io/dashboard</span>
              </div>
            </div>

            {/* Content for Active Preview Tab */}
            {activePreviewTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Recurring (MRR)</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground mt-1.5">$42,850.00</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>+14.2% MoM growth</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Annual Recurring (ARR)</div>
                    <div className="text-xl sm:text-2xl font-black text-foreground mt-1.5">$514,200.00</div>
                    <div className="text-xs text-muted-foreground mt-1">Normalized active contracts</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Subscriptions</div>
                    <div className="text-xl sm:text-2xl font-black text-primary mt-1.5">128 Active</div>
                    <div className="text-xs text-muted-foreground mt-1">98.4% retention rate</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Overdue AR Receivables</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">$1,240.00</div>
                    <div className="text-xs text-rose-500 font-semibold mt-1">2 priority collections</div>
                  </div>
                </div>

                {/* Subscriptions Mini Table */}
                <div className="rounded-2xl border border-border overflow-hidden bg-background">
                  <div className="bg-muted/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                    <span>Subscriber Account</span>
                    <span>Plan Cadence & Status</span>
                  </div>
                  <div className="divide-y divide-border text-xs">
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition">
                      <div>
                        <span className="font-bold text-foreground">Acme Corporation</span>
                        <span className="text-[11px] text-muted-foreground ml-2 font-mono">SUB-2026-0001</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">$1,200.00 / mo</span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition">
                      <div>
                        <span className="font-bold text-foreground">Apex Dynamics Ltd</span>
                        <span className="text-[11px] text-muted-foreground ml-2 font-mono">SUB-2026-0002</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">$560.00 / mo (Odoo)</span>
                        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition">
                      <div>
                        <span className="font-bold text-foreground">Starlight Global</span>
                        <span className="text-[11px] text-muted-foreground ml-2 font-mono">SUB-2026-0003</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">$290.00 / yr</span>
                        <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
                          PAUSED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'billing' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold text-sm">Deterministic Daily Billing Run Engine</div>
                      <div className="text-muted-foreground text-xs mt-0.5">
                        Scans subscriptions with nextBillingDate &lt;= windowDate and generates invoices with zero duplication.
                      </div>
                    </div>
                  </div>
                  <span className="rounded-lg bg-primary px-3 py-1 font-semibold text-primary-foreground text-xs">
                    Automated Batch Ready
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-muted-foreground font-semibold">Idempotency Constraint</div>
                    <div className="font-mono text-foreground font-bold mt-1 text-[11px]">
                      UNIQUE(subscriptionId, periodStart, periodEnd)
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-semibold">Net Terms Support</div>
                    <div className="text-foreground font-bold mt-1">Immediate, Net 15, Net 30, Net 60</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground font-semibold">Line Item Snapshot</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      100% Immutable Historical Snapshots
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'lifecycle' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      1. QUOTATION
                    </span>
                    <div className="text-foreground font-bold mt-2">Commercial Proposal</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Variant price deltas, custom discounts & validity.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      2. ACTIVE
                    </span>
                    <div className="text-foreground font-bold mt-2">Recurring Term</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Automated invoices, payment matching & renewals.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      3. PAUSE / RESUME
                    </span>
                    <div className="text-foreground font-bold mt-2">Lifecycle Flexibility</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Temporarily suspend billing without losing customer state.</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4 text-center">
                    <span className="rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-0.5 text-[10px] font-bold">
                      4. CLOSED
                    </span>
                    <div className="text-foreground font-bold mt-2">Graceful Churn / End</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Preserves full invoice and payment audit history.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CORE ARCHITECTURE & CAPABILITIES */}
      <section id="features" className="py-20 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Architecture</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1.5">
              Engineered for Zero Data Loss & High Concurrency
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Every operation is protected by database foreign keys, PostgreSQL ACID transactions, and tamper-evident audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Idempotent Billing Runs</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                Compound database constraints guarantee that duplicate invoices can never be generated for the same subscription period, even under concurrent retry execution.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Dynamic Variant Differentials</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                Add-on products support variant delta pricing (e.g. Odoo edition adds +$560.00). Cost prices remain strictly internal and hidden from customer endpoints.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Payment Reconciliation & Voiding</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                Allocate multi-invoice payments with real-time balance calculations. Voiding transactions automatically restores invoice balances with full audit trails.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Granular RBAC Security</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                ADMIN, STAFF, and CUSTOMER roles enforced at the API route layer. Customers are strictly isolated (AT-04) and cannot query other customer records.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">AR Aging & Cashflow Intelligence</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                Live Recharts visual trends: MRR growth curves, subscription health donut, and AR aging buckets (&lt;30d, 30-60d, 60-90d, 90d+) with 1-click detailed PDF audit & invoice export.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Immutable Audit Trail</h3>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                Sensitive operational mutations (plan edits, payment voids, invoice cancellations) record actor identity, timestamp, and JSON before/after state diffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 w-full bg-muted/20 border-t border-border">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Transparent Pricing</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1.5">
              Predictable Cadence for Every Stage
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Every tier includes full access to the billing engine, customer self-service portal, and database connectivity.
            </p>

            {/* Cadence Switcher */}
            <div className="mt-8 inline-flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly Cadence
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                  billingCycle === 'YEARLY'
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Yearly</span>
                <span className="rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {defaultPlans.map((p) => {
              const price = billingCycle === 'MONTHLY' ? p.priceMonthly : Math.round(p.priceYearly / 12);
              return (
                <div
                  key={p.id}
                  className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between transition ${
                    p.popular
                      ? 'border-primary bg-card shadow-2xl ring-2 ring-primary/20 relative'
                      : 'border-border bg-card shadow-sm hover:border-primary/40'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                      {p.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 min-h-[36px]">{p.description}</p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-foreground font-mono">${price}</span>
                      <span className="text-xs text-muted-foreground font-medium">/ month</span>
                    </div>
                    {billingCycle === 'YEARLY' && (
                      <span className="text-[10px] text-muted-foreground font-medium">Billed ${p.priceYearly} annually</span>
                    )}

                    <div className="my-6 border-t border-border" />

                    <div className="space-y-3 text-xs">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onEnterApp(p.targetTab)}
                    className={`mt-8 w-full rounded-xl py-3 text-xs font-bold transition active:scale-95 ${
                      p.popular
                        ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                        : 'border border-border bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    Select {p.name} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. POSTGRESQL 18.X DATABASE INTEGRATION SPOTLIGHT */}
      <section id="architecture" className="py-20 w-full border-t border-border">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-14 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
                <Database className="h-4 w-4" />
                <span>PostgreSQL 18.x / 17.x Monolith</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Connect Your Local Database in Seconds
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                Brightloop defaults to zero-setup SQLite for rapid local prototyping and includes an automated CLI script to switch directly to your production PostgreSQL cluster with full schema migrations and seed accounts.
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-muted/60 p-4 font-mono text-xs text-foreground flex items-center justify-between shadow-inner">
                <span>npm run db:connect &lt;your_postgres_password&gt;</span>
                <span className="rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-bold">
                  1-Command CLI
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onEnterApp('settings')}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition active:scale-95"
              >
                <span>Database Settings</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEnterApp('audit')}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-xs font-semibold text-foreground hover:bg-accent transition active:scale-95"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>View Compliance Logs</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-20 w-full bg-muted/20 border-t border-border">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Technical FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-5 transition shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-foreground"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-primary shrink-0 ml-3" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-3.5 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. EXPANSIVE FULL-WIDTH FOOTER */}
      <footer className="mt-auto border-t border-border bg-card py-12 w-full">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterApp('dashboard')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow">
              B
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Brightloop Software</div>
              <div className="text-xs text-muted-foreground">Enterprise Subscription Management 2.0</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-medium">
            <button onClick={() => onEnterApp('dashboard')} className="hover:text-foreground transition">
              Dashboard
            </button>
            <button onClick={() => onEnterApp('subscriptions')} className="hover:text-foreground transition">
              Subscriptions
            </button>
            <button onClick={() => onEnterApp('invoices')} className="hover:text-foreground transition">
              Invoices
            </button>
            <button onClick={() => onEnterApp('plans')} className="hover:text-foreground transition">
              Plans
            </button>
            <button onClick={() => onEnterApp('settings')} className="hover:text-foreground transition">
              Settings
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal (PostgreSQL Ready)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

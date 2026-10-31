'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Play,
  Plus,
  FileDown,
  FileText,
  UserPlus,
  Shield,
  UserCheck,
  Users,
  ChevronDown,
  CheckCircle2,
  X,
  ExternalLink,
  Globe,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { TabId } from './Sidebar';

interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

interface HeaderProps {
  activeTab: TabId;
  currentUser: AuthPrincipal | null;
  onSwitchUser: (email: string) => void;
  onOpenMobileSidebar: () => void;
  onTriggerBilling: () => void;
  onOpenNewQuote: () => void;
  onOpenSignUp: () => void;
  onOpenForgot: () => void;
  actionLoading?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onShowLanding?: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    createdAt?: string | Date;
  }>;
}

export default function Header({
  activeTab,
  currentUser,
  onSwitchUser,
  onOpenMobileSidebar,
  onTriggerBilling,
  onOpenNewQuote,
  onOpenSignUp,
  onOpenForgot,
  actionLoading = false,
  searchTerm,
  setSearchTerm,
  onShowLanding,
  notifications = [],
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaDropdownOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setPersonaDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getBreadcrumbTitle = (tab: TabId): string => {
    switch (tab) {
      case 'dashboard':
        return 'Executive Dashboard';
      case 'subscriptions':
        return currentUser?.role === 'CUSTOMER' ? 'My Subscriptions' : 'Subscriptions Management';
      case 'customers':
        return 'Customer Accounts & Organizations';
      case 'plans':
        return 'Billing Plans & Cadence';
      case 'invoices':
        return currentUser?.role === 'CUSTOMER' ? 'My Invoices & Receipts' : 'Invoices & Billing Schedule';
      case 'payments':
        return currentUser?.role === 'CUSTOMER' ? 'Payment History' : 'Payment Reconciliation & AR';
      case 'quotes':
        return currentUser?.role === 'CUSTOMER' ? 'Commercial Offers' : 'Quotations & Templates';
      case 'catalog':
        return 'Products & Variants Catalog';
      case 'discounts':
        return 'Tax Rates & Discount Rules';
      case 'analytics':
        return 'Revenue Analytics & MRR Waterfall';
      case 'audit':
        return 'System Audit Trail & Compliance';
      case 'settings':
        return 'Platform Settings & Staff Management';
      default:
        return 'Subscription Management';
    }
  };

  const isCustomer = currentUser?.role === 'CUSTOMER';
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span
              onClick={onShowLanding}
              className="cursor-pointer hover:text-primary transition font-bold"
              title="Go to Brightloop Landing Page"
            >
              Brightloop
            </span>
            <span>/</span>
            <span className="capitalize text-foreground font-semibold">{activeTab}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {getBreadcrumbTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="h-9 w-full rounded-lg border border-input bg-background/80 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, Theme, Persona */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Context Actions */}
        {!isCustomer && (
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>New Quote</span>
            </button>

            <button
              onClick={onTriggerBilling}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50 active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>{actionLoading ? 'Running...' : 'Run Billing Batch'}</span>
            </button>
          </div>
        )}

        {/* Export Detailed Report in PDF */}
        <a
          href="/api/v1/reports/export"
          target="_blank"
          title="Export Detailed Financial & Subscription Report in PDF"
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition"
        >
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="hidden md:inline">Export PDF</span>
        </a>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setPersonaDropdownOpen(false);
            }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notifications & Alerts
                </span>
                <span className="text-[10px] rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground font-semibold">
                  {notifications.length} Unread
                </span>
              </div>

              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    All systems operational. No unread alerts.
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      className="rounded-lg border border-border/60 bg-card p-2.5 text-xs transition hover:bg-accent/40"
                    >
                      <div className="font-semibold text-foreground text-xs">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{n.message}</div>
                      {n.createdAt && (
                        <div className="text-[10px] text-muted-foreground/80 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Quick Role / Persona Switcher Pill */}
        <div className="relative" ref={personaRef}>
          <button
            onClick={() => {
              setPersonaDropdownOpen(!personaDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-accent"
          >
            <span
              className={`rounded px-1.5 py-0.5 font-bold uppercase text-[9px] ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  : currentUser?.role === 'STAFF'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {currentUser?.role || 'USER'}
            </span>
            <span className="hidden sm:inline font-semibold text-foreground truncate max-w-[100px]">
              {currentUser?.name?.split(' ')[0] || currentUser?.email.split('@')[0]}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {personaDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Test Account
              </div>

              <button
                onClick={() => {
                  onSwitchUser('admin@brightloop.io');
                  setPersonaDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left hover:bg-accent transition"
              >
                <Shield className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">Admin</div>
                  <div className="text-[10px] text-muted-foreground truncate">admin@brightloop.io</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchUser('staff@brightloop.io');
                  setPersonaDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left hover:bg-accent transition"
              >
                <UserCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">Staff Operations</div>
                  <div className="text-[10px] text-muted-foreground truncate">staff@brightloop.io</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchUser('john@acme.com');
                  setPersonaDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left hover:bg-accent transition"
              >
                <Users className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground">Customer (Acme Corp)</div>
                  <div className="text-[10px] text-muted-foreground truncate">john@acme.com</div>
                </div>
              </button>

              <div className="my-1 border-t border-border" />

              <div className="flex gap-1 pt-1">
                <button
                  onClick={() => {
                    setPersonaDropdownOpen(false);
                    onOpenSignUp();
                  }}
                  className="flex-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground hover:bg-secondary/80 text-center"
                >
                  + Sign Up
                </button>
                <button
                  onClick={() => {
                    setPersonaDropdownOpen(false);
                    onOpenForgot();
                  }}
                  className="flex-1 rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-accent text-center"
                >
                  Reset Pwd
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

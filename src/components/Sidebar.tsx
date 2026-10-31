'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Users,
  Package,
  FileText,
  CreditCard,
  FileSpreadsheet,
  Boxes,
  Percent,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  LogOut,
  X,
  Sparkles,
  Globe,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'subscriptions'
  | 'customers'
  | 'plans'
  | 'invoices'
  | 'payments'
  | 'quotes'
  | 'catalog'
  | 'discounts'
  | 'analytics'
  | 'audit'
  | 'settings';

interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  currentUser: AuthPrincipal | null;
  onSwitchUser: (email: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onShowLanding?: () => void;
  stats?: {
    activeSubs?: number;
    overdueInvoices?: number;
    totalCustomers?: number;
  };
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  onLogout,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onShowLanding,
  stats,
}: SidebarProps) {
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const isCustomer = currentUser?.role === 'CUSTOMER';
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeVariant?: 'default' | 'danger' | 'info';
    visible: boolean;
    group: 'CORE' | 'FINANCE' | 'SYSTEM';
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
      group: 'CORE',
    },
    {
      id: 'subscriptions',
      label: isCustomer ? 'My Subscriptions' : 'Subscriptions',
      icon: Layers,
      badge: stats?.activeSubs,
      visible: true,
      group: 'CORE',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: stats?.totalCustomers,
      visible: !isCustomer,
      group: 'CORE',
    },
    {
      id: 'plans',
      label: 'Plans & Cadence',
      icon: Package,
      visible: !isCustomer,
      group: 'CORE',
    },
    {
      id: 'invoices',
      label: isCustomer ? 'My Invoices' : 'Invoices',
      icon: FileText,
      badge: stats?.overdueInvoices && stats.overdueInvoices > 0 ? stats.overdueInvoices : undefined,
      badgeVariant: 'danger',
      visible: true,
      group: 'FINANCE',
    },
    {
      id: 'payments',
      label: isCustomer ? 'Payment History' : 'Payments & AR',
      icon: CreditCard,
      visible: true,
      group: 'FINANCE',
    },
    {
      id: 'quotes',
      label: isCustomer ? 'My Quotations' : 'Quotes & Offers',
      icon: FileSpreadsheet,
      visible: true,
      group: 'FINANCE',
    },
    {
      id: 'catalog',
      label: 'Products & Variants',
      icon: Boxes,
      visible: !isCustomer,
      group: 'FINANCE',
    },
    {
      id: 'discounts',
      label: 'Taxes & Discounts',
      icon: Percent,
      visible: !isCustomer,
      group: 'FINANCE',
    },
    {
      id: 'analytics',
      label: 'Analytics & MRR',
      icon: BarChart3,
      visible: !isCustomer,
      group: 'SYSTEM',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: ShieldCheck,
      visible: !isCustomer,
      group: 'SYSTEM',
    },
    {
      id: 'settings',
      label: 'Settings & Team',
      icon: Settings,
      visible: true,
      group: 'SYSTEM',
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.visible);

  const getRoleBadgeClasses = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'STAFF':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'CUSTOMER':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
  };

  const handleNavClick = (tabId: TabId) => {
    setActiveTab(tabId);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300 ease-in-out lg:static ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <div
            onClick={onShowLanding}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group hover:opacity-90 transition"
            title="Go to Brightloop Landing Page"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-foreground text-base truncate group-hover:text-primary transition-colors">
                    Brightloop
                  </span>
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary border border-primary/20">
                    SaaS
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground truncate font-medium">
                  Subscription Platform
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      item.badgeVariant === 'danger'
                        ? 'bg-rose-500 text-white'
                        : isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Dot */}
                {collapsed && isActive && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Persona Switcher at Bottom */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              title={collapsed ? `${currentUser?.name || currentUser?.email} (${currentUser?.role})` : undefined}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-accent ${
                collapsed ? 'justify-center p-1.5' : ''
              }`}
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-bold text-xs shadow">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                    currentUser?.role === 'ADMIN'
                      ? 'bg-purple-500'
                      : currentUser?.role === 'STAFF'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {currentUser?.name || 'Authorized User'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeClasses(
                        currentUser?.role
                      )}`}
                    >
                      {currentUser?.role || 'USER'}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {currentUser?.email}
                    </span>
                  </div>
                </div>
              )}
            </button>

            {/* Persona Switcher Dropdown */}
            {personaMenuOpen && (
              <div
                className={`absolute z-50 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl backdrop-blur-md transition-all ${
                  collapsed ? 'left-full bottom-0 ml-2 w-64' : 'bottom-full left-0 mb-2 w-full'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Active Persona
                </div>

                <button
                  onClick={() => {
                    onSwitchUser('admin@brightloop.io');
                    setPersonaMenuOpen(false);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-accent ${
                    isAdmin ? 'bg-accent/60 font-semibold' : ''
                  }`}
                >
                  <Shield className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground font-medium">Administrator</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      admin@brightloop.io (Full Control)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSwitchUser('staff@brightloop.io');
                    setPersonaMenuOpen(false);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-accent ${
                    currentUser?.role === 'STAFF' ? 'bg-accent/60 font-semibold' : ''
                  }`}
                >
                  <UserCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground font-medium">Staff Operations</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      staff@brightloop.io (Billing & Quotes)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSwitchUser('john@acme.com');
                    setPersonaMenuOpen(false);
                  }}
                  className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-accent ${
                    isCustomer ? 'bg-accent/60 font-semibold' : ''
                  }`}
                >
                  <Users className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground font-medium">Customer (Acme Corp)</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      john@acme.com (Self-Service Portal)
                    </div>
                  </div>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  onClick={() => {
                    setPersonaMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

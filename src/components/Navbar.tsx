'use client';

import React, { useState } from 'react';
import {
  Layers,
  FileText,
  Shield,
  UserCheck,
  Users,
  ChevronDown,
  Database,
  ExternalLink,
} from 'lucide-react';

interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

export default function HeaderNavbar({
  currentUser,
  onSwitchUser,
  customers = [],
  onOpenSignUp,
  onOpenForgot,
}: {
  currentUser: AuthPrincipal | null;
  onSwitchUser: (email: string) => void;
  customers?: any[];
  onOpenSignUp?: () => void;
  onOpenForgot?: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">Brightloop</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              SMS v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500">Subscription Lifecycle & Recurring Billing</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Persona Switcher for Evaluator */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-300"
          >
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>Persona:</span>
            <span
              className={`rounded px-1.5 py-0.5 font-bold uppercase text-[10px] ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800'
                  : currentUser?.role === 'STAFF'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentUser?.role || 'GUEST'}
            </span>
            <span className="text-slate-800 font-semibold">{currentUser?.name || currentUser?.email}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Test Account
              </div>
              <button
                onClick={() => {
                  onSwitchUser('admin@brightloop.io');
                  setDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <div className="mt-0.5 rounded bg-purple-100 p-1 text-purple-700">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Admin (Full Control)</div>
                  <div className="text-[11px] text-slate-500">Catalog, plans, tax/discounts, staff invites</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchUser('staff@brightloop.io');
                  setDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <div className="mt-0.5 rounded bg-amber-100 p-1 text-amber-700">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Staff (Sarah Connor)</div>
                  <div className="text-[11px] text-slate-500">Quotations, billing runs, payments, invoices</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchUser('john@acme.com');
                  setDropdownOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <div className="mt-0.5 rounded bg-emerald-100 p-1 text-emerald-700">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Customer (Acme Corp)</div>
                  <div className="text-[11px] text-slate-500">Self-service portal, own invoices & subs</div>
                </div>
              </button>

              {customers
                .filter((c) => c.billingEmail !== 'john@acme.com')
                .slice(0, 4)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSwitchUser(c.billingEmail);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 border-t border-slate-100"
                  >
                    <div className="mt-0.5 rounded bg-blue-100 p-1 text-blue-700">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{c.legalName}</div>
                      <div className="text-[11px] text-slate-500">{c.billingEmail}</div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {onOpenSignUp && (
          <button
            onClick={onOpenSignUp}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>+ Customer Sign Up</span>
          </button>
        )}

        {onOpenForgot && (
          <button
            onClick={onOpenForgot}
            className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <span>Forgot Password?</span>
          </button>
        )}

        <a
          href="/api/v1/reports/export?type=invoices"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </a>
      </div>
    </header>
  );
}

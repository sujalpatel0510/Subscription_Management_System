import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function WelcomeCard({
  title = 'Welcome to Brightloop',
  subtitle = 'Manage your subscriptions smarter.',
  className = '',
}: WelcomeCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
          Subscription Workspace
        </span>
      </div>
    </section>
  );
}

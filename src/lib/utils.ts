import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", AUD: "A$", CAD: "C$", JPY: "¥",
};

export function formatMoney(amount: number | string | null | undefined, currency = "USD") {
  const value = Number(amount ?? 0);
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return symbol + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompactMoney(amount: number, currency = "USD") {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const abs = Math.abs(amount);
  return symbol + abs.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/** Relative time e.g. "3 days ago" / "in 2 weeks" */
export function timeRelative(date: string | Date | null | undefined) {
  if (!date) return "—";
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.round(diff / 86400000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(days) >= 60) return rtf.format(Math.round(days / 30), "month");
  if (Math.abs(days) >= 30) return rtf.format(days, "day");
  if (Math.abs(days) >= 1) return rtf.format(days, "day");
  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
  return rtf.format(Math.round(diff / 60000), "minute");
}

export function titleCase(s?: string | null) {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function truncate(s: string | null | undefined, max: number) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};

export function initials(name?: string | null, email?: string | null) {
  const src = name || email || "?";
  const parts = src.trim().split(/[\s@_.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

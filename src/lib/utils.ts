import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function getMonthName(month: number): string {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return months[month] || "";
}

export function getMonthNameShort(month: number): string {
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return months[month] || "";
}

export function getBudgetStatus(
  spent: number,
  budget: number
): "good" | "warning" | "danger" {
  if (budget === 0) return "good";
  const ratio = spent / budget;
  if (ratio < 0.5) return "good";
  if (ratio < 0.8) return "warning";
  return "danger";
}

export function getBudgetColor(status: "good" | "warning" | "danger"): string {
  switch (status) {
    case "good":
      return "#22c55e";
    case "warning":
      return "#f59e0b";
    case "danger":
      return "#ef4444";
  }
}

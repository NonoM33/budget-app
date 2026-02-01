"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function AddExpenseFAB() {
  return (
    <Link
      href="/expenses/new"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-primary/40"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}

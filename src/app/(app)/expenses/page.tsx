"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExpenseCard } from "@/components/expense-card";
import { AddExpenseFAB } from "@/components/add-expense-fab";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/components/category-icon";
import {
  getMonthName,
  formatCurrency,
} from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  shared: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  user: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });
      if (filterCategory) {
        params.set("categoryId", filterCategory);
      }

      const [expRes, catRes] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch("/api/categories"),
      ]);

      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(data);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year, filterCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by date
  const grouped = expenses.reduce(
    (acc, expense) => {
      const dateKey = new Date(expense.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>
  );

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dépenses</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            showFilters || filterCategory
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <span className="text-lg font-semibold">
            {getMonthName(month - 1)} {year}
          </span>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalMonth)}
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterCategory(null)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              !filterCategory
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setFilterCategory(
                  filterCategory === cat.id ? null : cat.id
                )
              }
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                filterCategory === cat.id
                  ? "text-white"
                  : "bg-secondary text-secondary-foreground"
              }`}
              style={
                filterCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              <CategoryIcon icon={cat.icon} color={filterCategory === cat.id ? "#fff" : cat.color} size="sm" className="!h-5 !w-5 [&_svg]:!h-3 [&_svg]:!w-3" />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filterCategory && (
        <button
          onClick={() => setFilterCategory(null)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Effacer le filtre
        </button>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Aucune dépense</p>
          <p className="text-sm mt-1">
            Appuyez sur + pour ajouter une dépense
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayExpenses]) => (
            <div key={date}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {date}
              </h3>
              <div className="space-y-1 rounded-xl overflow-hidden border">
                {dayExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onDelete={handleDelete}
                    onClick={() =>
                      router.push(`/expenses/${expense.id}/edit`)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExpenseFAB />
    </div>
  );
}

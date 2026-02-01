"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetProgress } from "@/components/budget-progress";
import { ExpenseCard } from "@/components/expense-card";
import { MonthlyChart } from "@/components/monthly-chart";
import { AddExpenseFAB } from "@/components/add-expense-fab";
import { useTheme } from "@/components/providers";
import {
  formatCurrency,
  getMonthName,
} from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StatsData {
  totalSpent: number;
  totalBudget: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    spent: number;
    budget: number;
  }>;
  recentExpenses: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
    shared: boolean;
    category: {
      name: string;
      icon: string;
      color: string;
    };
    user: {
      name: string;
    };
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stats?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const budgetPercentage =
    stats && stats.totalBudget > 0
      ? Math.round((stats.totalSpent / stats.totalBudget) * 100)
      : 0;

  const remaining =
    stats ? stats.totalBudget - stats.totalSpent : 0;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Bonjour{session?.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Votre aperçu financier
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg font-semibold min-w-[160px] text-center">
          {getMonthName(month - 1)} {year}
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : stats ? (
        <>
          {/* Total Card */}
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total dépensé
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(stats.totalSpent)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    sur {formatCurrency(stats.totalBudget)} de budget
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      remaining >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {remaining >= 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    {budgetPercentage}%
                  </div>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      remaining >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {remaining >= 0 ? "+" : ""}
                    {formatCurrency(remaining)}
                  </p>
                  <p className="text-xs text-muted-foreground">restant</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(budgetPercentage, 100)}%`,
                      backgroundColor:
                        budgetPercentage > 80
                          ? "#ef4444"
                          : budgetPercentage > 50
                          ? "#f59e0b"
                          : "#22c55e",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Répartition des dépenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart
                data={stats.byCategory.map((c) => ({
                  name: c.categoryName,
                  spent: c.spent,
                  color: c.categoryColor,
                }))}
              />
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.byCategory
                  .filter((c) => c.spent > 0)
                  .map((c) => (
                    <div
                      key={c.categoryId}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.categoryColor }}
                      />
                      <span className="truncate text-muted-foreground">
                        {c.categoryName}
                      </span>
                      <span className="font-medium tabular-nums ml-auto">
                        {formatCurrency(c.spent)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget par catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.byCategory
                .filter((c) => c.budget > 0)
                .map((c) => (
                  <BudgetProgress
                    key={c.categoryId}
                    category={{
                      name: c.categoryName,
                      icon: c.categoryIcon,
                      color: c.categoryColor,
                    }}
                    spent={c.spent}
                    budget={c.budget}
                  />
                ))}
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Dernières dépenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {stats.recentExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune dépense ce mois
                </p>
              ) : (
                stats.recentExpenses.slice(0, 5).map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onClick={() =>
                      router.push(`/expenses/${expense.id}/edit`)
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Impossible de charger les données
        </div>
      )}

      <AddExpenseFAB />
    </div>
  );
}

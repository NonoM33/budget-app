"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetProgress } from "@/components/budget-progress";
import { CategoryIcon } from "@/components/category-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  formatCurrency,
  getMonthName,
} from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface BudgetItem {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  category: Category;
}

interface CategoryWithBudget {
  category: Category;
  budget: number;
  spent: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryWithBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });

      const [budgetRes, catRes, statsRes] = await Promise.all([
        fetch(`/api/budgets?${params}`),
        fetch("/api/categories"),
        fetch(`/api/stats?${params}`),
      ]);

      let budgetsData: BudgetItem[] = [];
      let catsData: Category[] = [];
      let statsData: { byCategory: Array<{ categoryId: string; spent: number }> } | null = null;

      if (budgetRes.ok) budgetsData = await budgetRes.json();
      if (catRes.ok) catsData = await catRes.json();
      if (statsRes.ok) statsData = await statsRes.json();

      setBudgets(budgetsData);
      setCategories(catsData);

      // Merge categories with budget and spending data
      const merged = catsData.map((cat) => {
        const budget = budgetsData.find((b) => b.categoryId === cat.id);
        const statCat = statsData?.byCategory?.find((c) => c.categoryId === cat.id);
        return {
          category: cat,
          budget: budget?.amount || 0,
          spent: statCat?.spent || 0,
        };
      });

      setCategoryData(merged);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const openEdit = (cat: Category, currentBudget: number) => {
    setEditCategory(cat);
    setEditAmount(currentBudget > 0 ? currentBudget.toString() : "");
    setEditDialog(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;

    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(editAmount) || 0,
          categoryId: editCategory.id,
          month,
          year,
        }),
      });

      if (res.ok) {
        await fetchData();
        setEditDialog(false);
      }
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = categoryData.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categoryData.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const categoriesWithBudget = categoryData.filter((c) => c.budget > 0);
  const categoriesWithoutBudget = categoryData.filter((c) => c.budget === 0);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Budgets</h1>
        <p className="text-sm text-muted-foreground">
          Définissez vos limites par catégorie
        </p>
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
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Total Card */}
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget total</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(totalBudget)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(totalSpent)} dépensé
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
                    {percentage}%
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

              <div className="mt-4">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor:
                        percentage > 90
                          ? "#ef4444"
                          : percentage > 60
                          ? "#f59e0b"
                          : "#22c55e",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budgets with amount */}
          {categoriesWithBudget.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Catégories avec budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoriesWithBudget.map((item) => (
                  <BudgetProgress
                    key={item.category.id}
                    category={{
                      name: item.category.name,
                      icon: item.category.icon,
                      color: item.category.color,
                    }}
                    spent={item.spent}
                    budget={item.budget}
                    onClick={() => openEdit(item.category, item.budget)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Categories without budget */}
          {categoriesWithoutBudget.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sans budget défini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {categoriesWithoutBudget.map((item) => (
                    <button
                      key={item.category.id}
                      onClick={() => openEdit(item.category, 0)}
                      className="flex items-center gap-2.5 rounded-xl p-3 hover:bg-accent transition-colors text-left"
                    >
                      <CategoryIcon
                        icon={item.category.icon}
                        color={item.category.color}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.category.name}
                        </p>
                        {item.spent > 0 && (
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {formatCurrency(item.spent)} dépensé
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editCategory && (
                <CategoryIcon
                  icon={editCategory.icon}
                  color={editCategory.color}
                  size="sm"
                />
              )}
              Budget {editCategory?.name}
            </DialogTitle>
            <DialogDescription>
              {getMonthName(month - 1)} {year}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-amount">Montant du budget (€)</Label>
              <Input
                id="budget-amount"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

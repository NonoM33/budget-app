"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/components/category-icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  frequency: string;
  active: boolean;
  shared: boolean;
  nextDate: string;
  category: Category;
  user: { name: string };
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Mensuel",
  weekly: "Hebdo",
  yearly: "Annuel",
};

const FREQUENCY_COLORS: Record<string, string> = {
  monthly: "bg-blue-500/10 text-blue-500",
  weekly: "bg-purple-500/10 text-purple-500",
  yearly: "bg-amber-500/10 text-amber-500",
};

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [categoryId, setCategoryId] = useState("");
  const [shared, setShared] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recRes, catRes] = await Promise.all([
        fetch("/api/recurring"),
        fetch("/api/categories"),
      ]);
      if (recRes.ok) setItems(await recRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, active: !active } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette dépense récurrente ?")) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !categoryId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          frequency,
          categoryId,
          shared,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems((prev) => [newItem, ...prev]);
        resetForm();
        setShowDialog(false);
      }
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setFrequency("monthly");
    setCategoryId("");
    setShared(false);
  };

  const getMonthlyEquivalent = (amount: number, frequency: string) => {
    switch (frequency) {
      case "weekly":
        return amount * 4.33;
      case "yearly":
        return amount / 12;
      default:
        return amount;
    }
  };

  const totalMonthly = items
    .filter((item) => item.active)
    .reduce((sum, item) => sum + getMonthlyEquivalent(item.amount, item.frequency), 0);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dépenses récurrentes</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos prélèvements et abonnements
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Coût mensuel total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">Aucune dépense récurrente</p>
          <p className="text-sm mt-1">Appuyez sur + pour en ajouter une</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`transition-all ${!item.active ? "opacity-50" : ""}`}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <CategoryIcon
                  icon={item.category.icon}
                  color={item.category.color}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.description}</p>
                    {item.shared && (
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-[10px] border-0 ${
                        FREQUENCY_COLORS[item.frequency] || ""
                      }`}
                    >
                      {FREQUENCY_LABELS[item.frequency] || item.frequency}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {item.user.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(item.amount)}
                    </p>
                    {item.frequency !== "monthly" && (
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        ~{formatCurrency(getMonthlyEquivalent(item.amount, item.frequency))}/mois
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Switch
                      checked={item.active}
                      onCheckedChange={() => toggleActive(item.id, item.active)}
                    />
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle dépense récurrente</DialogTitle>
            <DialogDescription>
              Ajoutez un abonnement ou prélèvement régulier
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rec-description">Description</Label>
              <Input
                id="rec-description"
                placeholder="Ex: Netflix, Loyer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-amount">Montant (€)</Label>
              <Input
                id="rec-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fréquence</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["monthly", "weekly", "yearly"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      frequency === freq
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {FREQUENCY_LABELS[freq]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all ${
                      categoryId === cat.id
                        ? "ring-2 ring-offset-2 ring-offset-background scale-105"
                        : "hover:bg-accent"
                    }`}
                    style={
                      categoryId === cat.id
                        ? { ["--tw-ring-color" as string]: cat.color }
                        : undefined
                    }
                  >
                    <CategoryIcon icon={cat.icon} color={cat.color} size="sm" />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">Dépense partagée</p>
                  <p className="text-xs text-muted-foreground">
                    Partagée entre vous deux
                  </p>
                </div>
                <Switch checked={shared} onCheckedChange={setShared} />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !amount || !description || !categoryId}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

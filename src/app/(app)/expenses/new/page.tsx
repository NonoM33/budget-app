"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function NewExpensePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || categories.find(c => c.id === categoryId)?.name || "Dépense",
          categoryId,
          date,
          shared,
        }),
      });

      if (res.ok) {
        router.push("/expenses");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create expense:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/expenses"
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Nouvelle dépense</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div className="text-center py-4">
          <Label className="text-sm text-muted-foreground">Montant</Label>
          <div className="flex items-center justify-center gap-2 mt-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="text-4xl font-bold text-center bg-transparent border-none outline-none w-48 tabular-nums placeholder:text-muted-foreground/30"
              required
              autoFocus
            />
            <span className="text-2xl font-bold text-muted-foreground">€</span>
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all ${
                  categoryId === cat.id
                    ? "ring-2 ring-offset-2 ring-offset-background scale-105"
                    : "hover:bg-accent"
                }`}
                style={
                  categoryId === cat.id
                    ? { borderColor: cat.color, borderWidth: 2 }
                    : undefined
                }
              >
                <CategoryIcon
                  icon={cat.icon}
                  color={cat.color}
                  size="md"
                />
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Input
            id="description"
            placeholder="Ex: Carrefour, Restaurant..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Shared Toggle */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Dépense partagée</p>
              <p className="text-sm text-muted-foreground">
                Partagée entre vous deux
              </p>
            </div>
            <Switch
              checked={shared}
              onCheckedChange={setShared}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-base"
          size="lg"
          disabled={loading || !amount || !categoryId}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Ajouter la dépense"
          )}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistCard } from "@/components/wishlist-card";
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
  Star,
  Loader2,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  price: number | null;
  url: string | null;
  priority: number;
  purchased: boolean;
  purchasedAt: string | null;
  userId: string;
  user: { id: string; name: string };
}

type FilterType = "all" | "mine" | "purchased";
type SortType = "priority" | "price";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("priority");

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState(3);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePurchased = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased: !item.purchased }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev.map((i) => (i.id === id ? updated : i))
        );
      }
    } catch (err) {
      console.error("Failed to toggle:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: price || null,
          url: url || null,
          priority,
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
    setName("");
    setPrice("");
    setUrl("");
    setPriority(3);
  };

  const userId = (session?.user as { id: string } | undefined)?.id;

  // Filter items
  let filtered = items;
  if (filter === "mine") {
    filtered = items.filter((i) => i.userId === userId);
  } else if (filter === "purchased") {
    filtered = items.filter((i) => i.purchased);
  } else {
    filtered = items.filter((i) => !i.purchased);
  }

  // Sort items
  if (sort === "price") {
    filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
  } else {
    filtered = [...filtered].sort((a, b) => b.priority - a.priority);
  }

  const totalUnpurchased = items
    .filter((i) => !i.purchased)
    .reduce((sum, i) => sum + (i.price || 0), 0);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "À acheter" },
    { key: "mine", label: "Les miens" },
    { key: "purchased", label: "Achetés" },
  ];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Liste de souhaits</h1>
          <p className="text-sm text-muted-foreground">
            {totalUnpurchased > 0
              ? `Total restant : ${formatCurrency(totalUnpurchased)}`
              : "Vos envies partagées ✨"}
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSort(sort === "priority" ? "price" : "priority")}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors whitespace-nowrap"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sort === "priority" ? "Priorité" : "Prix"}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">
            {filter === "purchased"
              ? "Rien d'acheté pour le moment"
              : "Aucun souhait"}
          </p>
          <p className="text-sm mt-1">Appuyez sur + pour ajouter un souhait</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onTogglePurchased={togglePurchased}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau souhait</DialogTitle>
            <DialogDescription>
              Ajoutez un article à votre liste
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wish-name">Nom</Label>
              <Input
                id="wish-name"
                placeholder="Ex: AirPods Pro, Robot cuisine..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wish-price">Prix estimé (€)</Label>
              <Input
                id="wish-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wish-url">Lien (optionnel)</Label>
              <Input
                id="wish-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Priorité</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPriority(i + 1)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        i < priority
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !name}
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

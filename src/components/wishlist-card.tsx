"use client";

import { formatCurrency } from "@/lib/utils";
import { Star, ExternalLink, Check, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface WishlistCardProps {
  item: {
    id: string;
    name: string;
    price: number | null;
    url: string | null;
    priority: number;
    purchased: boolean;
    user: {
      name: string;
    };
  };
  onTogglePurchased?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WishlistCard({
  item,
  onTogglePurchased,
  onDelete,
}: WishlistCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-all ${
        item.purchased ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              item.purchased ? "line-through" : ""
            }`}
          >
            {item.name}
          </h3>

          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < item.priority
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {item.price && (
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(item.price)}
              </span>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {item.user.name}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Button
          variant={item.purchased ? "secondary" : "default"}
          size="sm"
          className="flex-1"
          onClick={() => onTogglePurchased?.(item.id)}
        >
          <Check className="h-4 w-4" />
          {item.purchased ? "Acheté ✓" : "Marquer acheté"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(item.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

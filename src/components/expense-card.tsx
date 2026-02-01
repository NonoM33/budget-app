"use client";

import { formatCurrency, formatDateShort } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Badge } from "./ui/badge";
import { Users, Trash2 } from "lucide-react";
import { useState } from "react";

interface ExpenseCardProps {
  expense: {
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
  };
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onDelete, onClick }: ExpenseCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 80) {
      setShowDelete(true);
    } else if (diff < -80) {
      setShowDelete(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action (swipe left) */}
      {showDelete && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(expense.id);
            }}
            className="flex h-full items-center bg-destructive px-6 text-destructive-foreground"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        className="flex items-center gap-3 bg-card p-3 transition-transform duration-200 cursor-pointer active:bg-accent/50"
        style={{
          transform: showDelete ? "translateX(-64px)" : "translateX(0)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={onClick}
      >
        <CategoryIcon
          icon={expense.category.icon}
          color={expense.category.color}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{expense.description}</p>
            {expense.shared && (
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {expense.category.name}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {expense.user.name}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatDateShort(expense.date)}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-semibold tabular-nums">
            {formatCurrency(expense.amount)}
          </p>
          {expense.shared && (
            <Badge variant="secondary" className="text-[10px] mt-0.5">
              Partagé
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

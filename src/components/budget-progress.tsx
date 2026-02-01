"use client";

import {
  formatCurrency,
  getBudgetStatus,
  getBudgetColor,
} from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { Progress } from "./ui/progress";

interface BudgetProgressProps {
  category: {
    name: string;
    icon: string;
    color: string;
  };
  spent: number;
  budget: number;
  onClick?: () => void;
}

export function BudgetProgress({
  category,
  spent,
  budget,
  onClick,
}: BudgetProgressProps) {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const status = getBudgetStatus(spent, budget);
  const statusColor = getBudgetColor(status);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-card cursor-pointer active:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CategoryIcon icon={category.icon} color={category.color} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium truncate">
            {category.name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
            {formatCurrency(spent)} / {formatCurrency(budget)}
          </span>
        </div>
        <Progress
          value={percentage}
          indicatorColor={statusColor}
          className="h-2"
        />
      </div>
    </div>
  );
}

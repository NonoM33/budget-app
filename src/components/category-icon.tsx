"use client";

import {
  Home,
  ShoppingCart,
  Car,
  UtensilsCrossed,
  Gamepad2,
  Heart,
  Smartphone,
  Package,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Home,
  ShoppingCart,
  Car,
  UtensilsCrossed,
  Gamepad2,
  Heart,
  Smartphone,
  Package,
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryIcon({
  icon,
  color,
  size = "md",
  className,
}: CategoryIconProps) {
  const Icon = iconMap[icon] || Package;

  const sizeClasses = {
    sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
    md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
    lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <Icon />
    </div>
  );
}

export const CATEGORIES = [
  { name: "Loyer", icon: "Home", color: "#6366f1" },
  { name: "Courses", icon: "ShoppingCart", color: "#22c55e" },
  { name: "Transport", icon: "Car", color: "#f59e0b" },
  { name: "Restaurants", icon: "UtensilsCrossed", color: "#ef4444" },
  { name: "Loisirs", icon: "Gamepad2", color: "#8b5cf6" },
  { name: "Santé", icon: "Heart", color: "#06b6d4" },
  { name: "Abonnements", icon: "Smartphone", color: "#ec4899" },
  { name: "Autres", icon: "Package", color: "#6b7280" },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];
export type CategoryIcon = (typeof CATEGORIES)[number]["icon"];

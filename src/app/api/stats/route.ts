import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      include: {
        category: true,
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    const budgets = await prisma.budget.findMany({ where: { month, year } });

    const byCategory = categories.map((cat) => {
      const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
      const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const catBudgets = budgets.filter((b) => b.categoryId === cat.id);
      const budget = catBudgets.reduce((sum, b) => sum + b.amount, 0);

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        spent,
        budget,
      };
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const recentExpenses = expenses.slice(0, 10);

    return NextResponse.json({ totalSpent, totalBudget, byCategory, recentExpenses });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

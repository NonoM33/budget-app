import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const categoryId = searchParams.get("categoryId");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const where: Record<string, unknown> = {
      date: { gte: startDate, lt: endDate },
    };
    if (categoryId) where.categoryId = categoryId;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        user: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await request.json();
    const { amount, description, categoryId, date, shared } = body;

    if (!amount || !categoryId) {
      return NextResponse.json({ error: "Montant et catégorie requis" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description: description || "Dépense",
        categoryId,
        date: new Date(date || new Date()),
        shared: shared || false,
        userId: auth.userId!,
      },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

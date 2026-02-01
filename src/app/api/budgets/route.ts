import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  try {
    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: {
        category: true,
        user: { select: { name: true } },
      },
      orderBy: { category: { order: "asc" } },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Failed to fetch budgets:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, categoryId, month, year } = body;

    if (amount === undefined || !categoryId || !month || !year) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const userId = (session.user as { id: string }).id;

    const budget = await prisma.budget.upsert({
      where: {
        categoryId_userId_month_year: {
          categoryId,
          userId,
          month,
          year,
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        amount: parseFloat(amount),
        categoryId,
        month,
        year,
        userId,
      },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Failed to upsert budget:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

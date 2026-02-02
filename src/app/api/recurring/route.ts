import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const recurring = await prisma.recurringExpense.findMany({
      include: {
        category: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recurring);
  } catch (error) {
    console.error("Failed to fetch recurring:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await request.json();
    const { amount, description, frequency, categoryId, shared, nextDate } = body;

    if (!amount || !description || !frequency || !categoryId) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const recurring = await prisma.recurringExpense.create({
      data: {
        amount: parseFloat(amount),
        description,
        frequency,
        categoryId,
        shared: shared || false,
        nextDate: nextDate ? new Date(nextDate) : new Date(),
        userId: auth.userId!,
      },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(recurring, { status: 201 });
  } catch (error) {
    console.error("Failed to create recurring:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

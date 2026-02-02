import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  const { id } = await params;

  try {
    const body = await request.json();
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.shared !== undefined && { shared: body.shared }),
      },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update expense:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  const { id } = await params;

  try {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

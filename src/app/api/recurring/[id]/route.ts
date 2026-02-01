import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Dépense récurrente introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.frequency !== undefined && { frequency: body.frequency }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.shared !== undefined && { shared: body.shared }),
        ...(body.nextDate !== undefined && { nextDate: new Date(body.nextDate) }),
      },
      include: {
        category: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update recurring:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.recurringExpense.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Dépense récurrente introuvable" },
        { status: 404 }
      );
    }

    await prisma.recurringExpense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recurring:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

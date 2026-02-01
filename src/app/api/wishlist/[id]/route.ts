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

    const existing = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: body.price ? parseFloat(body.price) : null }),
        ...(body.url !== undefined && { url: body.url }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.purchased !== undefined && {
          purchased: body.purchased,
          purchasedAt: body.purchased ? new Date() : null,
        }),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update wishlist item:", error);
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
    const existing = await prisma.wishlistItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete wishlist item:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

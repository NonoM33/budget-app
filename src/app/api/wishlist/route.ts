import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const items = await prisma.wishlistItem.findMany({
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: [{ purchased: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await request.json();
    const { name, price, url, priority } = body;

    if (!name) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        name,
        price: price ? parseFloat(price) : null,
        url: url || null,
        priority: priority || 3,
        userId: auth.userId!,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create wishlist item:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

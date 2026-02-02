import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

interface AuthResult {
  authenticated: boolean;
  userId: string | null;
  error?: NextResponse;
}

/**
 * Unified auth: checks session OR API key (X-API-Key header).
 * API key also requires X-User-Email to know which user to act as.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  // 1. Try session auth first
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      authenticated: true,
      userId: (session.user as { id: string }).id,
    };
  }

  // 2. Try API key auth
  const apiKey = request.headers.get("x-api-key");
  const userEmail = request.headers.get("x-user-email");

  if (apiKey && apiKey === process.env.API_SECRET_KEY) {
    if (!userEmail) {
      return {
        authenticated: false,
        userId: null,
        error: NextResponse.json(
          { error: "X-User-Email header required with API key" },
          { status: 400 }
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return {
        authenticated: false,
        userId: null,
        error: NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ),
      };
    }

    return {
      authenticated: true,
      userId: user.id,
    };
  }

  return {
    authenticated: false,
    userId: null,
    error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }),
  };
}

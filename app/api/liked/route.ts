import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET /api/liked — list the logged-in user's liked products (full product
// data, for rendering ProductCard grids), plus just the bare IDs for quick
// "is this one liked" checks elsewhere (e.g. the heart button on every card).
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const liked = await prisma.likedProduct.findMany({
      where:   { userId },
      include: { shopProduct: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      products: liked.map((l) => l.shopProduct),
      likedIds: liked.map((l) => l.shopProductId),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load liked products." }, { status: 500 });
  }
}

// POST /api/liked  { shopProductId }
// Toggles like/unlike. Returns the new state so the caller doesn't need to
// track it separately.
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { shopProductId } = await req.json();
    if (!shopProductId) return NextResponse.json({ error: "Product is required." }, { status: 400 });

    const existing = await prisma.likedProduct.findUnique({
      where: { userId_shopProductId: { userId, shopProductId } },
    });

    if (existing) {
      await prisma.likedProduct.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.likedProduct.create({ data: { userId, shopProductId } });
    return NextResponse.json({ liked: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// PATCH /api/cart/[id]  { quantity }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { id } = await params;
    const { quantity } = await req.json();
    const qty = Number(quantity);
    if (!qty || qty < 1) return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });

    const existing = await prisma.cartItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }

    const item = await prisma.cartItem.update({ where: { id }, data: { quantity: qty } });
    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update cart item." }, { status: 500 });
  }
}

// DELETE /api/cart/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.cartItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove cart item." }, { status: 500 });
  }
}

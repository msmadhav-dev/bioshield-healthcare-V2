import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";
import { VALID_COUPONS } from "@/lib/pricing";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// POST /api/cart/coupon  { code }
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { code } = await req.json();
    const upper = (code || "").toUpperCase().trim();

    if (!VALID_COUPONS[upper]) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: { appliedCouponCode: upper } });
    return NextResponse.json({ success: true, code: upper });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to apply coupon." }, { status: 500 });
  }
}

// DELETE /api/cart/coupon
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    await prisma.user.update({ where: { id: userId }, data: { appliedCouponCode: null } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove coupon." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

// GET /api/auth/me — reads the httpOnly session cookie (if any) and returns
// the logged-in user, or { user: null } if not logged in / expired.
// Also returns the city of the user's first saved address, so the navbar
// can show it instead of the hardcoded "Chennai".
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = token ? verifySessionToken(token) : null;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: { orderBy: { createdAt: "asc" }, take: 1 } },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { addresses, ...userFields } = user;
    return NextResponse.json({
      user: { ...userFields, city: addresses[0]?.district || null },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null });
  }
}

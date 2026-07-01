import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// PATCH /api/addresses/[id]  { isDefault: true }
// Marks this address as the default, unsetting any other default for this user.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { id } = await params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    const updated = await prisma.address.findUnique({ where: { id } });
    return NextResponse.json({ address: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to set default address." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

const MAX_ADDRESSES = 4;

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET /api/addresses — list the logged-in user's saved addresses.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const addresses = await prisma.address.findMany({
      where:   { userId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load addresses." }, { status: 500 });
  }
}

// POST /api/addresses  { label, doorNo, street, cityTown, pincode }
// District and state are resolved server-side from the pincode (never
// trusted from the client) so they always match what the user was shown.
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { label, doorNo, street, cityTown, pincode } = await req.json();

    if (!label?.trim())    return NextResponse.json({ error: "Label is required." }, { status: 400 });
    if (!doorNo?.trim())   return NextResponse.json({ error: "Door no. is required." }, { status: 400 });
    if (!street?.trim())   return NextResponse.json({ error: "Street/Landmark is required." }, { status: 400 });
    if (!cityTown?.trim()) return NextResponse.json({ error: "City/Town is required." }, { status: 400 });
    if (!/^\d{6}$/.test(pincode)) return NextResponse.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });

    const count = await prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      return NextResponse.json({ error: `You can save up to ${MAX_ADDRESSES} addresses only.` }, { status: 400 });
    }

    const pinRes  = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const pinData = await pinRes.json();
    const office  = Array.isArray(pinData) && pinData[0]?.Status === "Success" ? pinData[0].PostOffice?.[0] : null;

    if (!office) {
      return NextResponse.json({ error: "Could not find a district/state for that PIN code." }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label:    label.trim(),
        doorNo:   doorNo.trim(),
        street:   street.trim(),
        cityTown: cityTown.trim(),
        pincode,
        district: office.District,
        state:    office.State,
      },
    });

    return NextResponse.json({ address });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save address." }, { status: 500 });
  }
}

// DELETE /api/addresses?id=...
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Address id is required." }, { status: 400 });

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: "Address not found." }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}

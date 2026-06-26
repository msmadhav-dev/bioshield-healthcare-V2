import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

// PATCH /api/users/me  { name?, gender?, age?, role?, hospitalName? }
// Updates the logged-in user's own profile. Identity comes from the session
// cookie, never from the request body.
export async function PATCH(req: NextRequest) {
  try {
    const token  = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = token ? verifySessionToken(token) : null;
    if (!userId) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, gender, age, role, hospitalName } = body;

    if (role && role !== "CUSTOMER" && role !== "DOCTOR") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "DOCTOR" && !hospitalName) {
      return NextResponse.json({ error: "Hospital name is required for doctors" }, { status: 400 });
    }
    if (age !== undefined && (Number(age) <= 0 || Number(age) > 120)) {
      return NextResponse.json({ error: "Please enter a valid age." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name:         name?.trim()  || undefined,
        email:        email !== undefined ? email : undefined,
        gender:       gender        || undefined,
        age:          age !== undefined ? Number(age) : undefined,
        role:         role          || undefined,
        hospitalName: role ? (role === "DOCTOR" ? hospitalName : null) : undefined,
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

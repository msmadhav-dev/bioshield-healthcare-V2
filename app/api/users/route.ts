import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPhoneToken } from "@/lib/otpToken";
import { issueSessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, in seconds

function setSessionCookie(res: NextResponse, userId: string) {
  res.cookies.set(SESSION_COOKIE_NAME, issueSessionToken(userId), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   COOKIE_MAX_AGE,
  });
}

// GET /api/users?token=...  — "Returning User" login: check if an account
// exists for the OTP-verified phone. On success this IS the login moment,
// so it also sets the long-lived session cookie.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const phone = token ? verifyPhoneToken(token) : null;
    if (!phone) {
      return NextResponse.json({ error: "OTP verification required or expired." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const res = NextResponse.json({ user });
    setSessionCookie(res, user.id);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
  }
}

// POST /api/users  — "New User" finish step. Requires the signed OTP token;
// the phone stored is the one from the token, not whatever the body claims.
// On success this is also the login moment, so it sets the session cookie too.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, hospitalName, gender, age, token } = body;

    const phone = token ? verifyPhoneToken(token) : null;
    if (!phone) {
      return NextResponse.json({ error: "OTP verification required or expired." }, { status: 401 });
    }

    if (!name || !email || !role || !gender || !age) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (role !== "CUSTOMER" && role !== "DOCTOR") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "DOCTOR" && !hospitalName) {
      return NextResponse.json({ error: "Hospital name is required for doctors" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "An account with this phone number already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        hospitalName: role === "DOCTOR" ? hospitalName : null,
        gender,
        age: Number(age),
      },
    });

    const res = NextResponse.json({ user });
    setSessionCookie(res, user.id);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

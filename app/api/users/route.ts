import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPhoneToken } from "@/lib/otpToken";

// Both routes require the signed phone-token issued by /api/otp/verify.
// The phone is read FROM THE TOKEN, never trusted from the request body —
// so a caller can only ever act on a number they actually verified via OTP.

// GET /api/users?token=...  — "Returning User" login: check if an account
// exists for the OTP-verified phone.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const phone = token ? verifyPhoneToken(token) : null;
    if (!phone) {
      return NextResponse.json({ error: "OTP verification required or expired." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    return NextResponse.json({ user: user || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
  }
}

// POST /api/users  — "New User" finish step. Requires the signed token; the
// phone stored is the one from the token, not whatever the body claims.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, hospitalName, gender, age, token } = body;

    const phone = token ? verifyPhoneToken(token) : null;
    if (!phone) {
      return NextResponse.json({ error: "OTP verification required or expired." }, { status: 401 });
    }

    if (!name || !role || !gender || !age) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        phone,
        role,
        hospitalName: role === "DOCTOR" ? hospitalName : null,
        gender,
        age: Number(age),
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
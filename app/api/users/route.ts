import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users?phone=9876543210 — used by the "Returning User" login flow
// to check whether an account exists for this phone number after OTP verification.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    return NextResponse.json({ user: user || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });
  }
}

// POST /api/users — used by the "New User" signup flow's final "Finish" step,
// after name/phone + OTP have already been collected.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, role, hospitalName, gender, age } = body;

    if (!name || !phone || !role || !gender || !age) {
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
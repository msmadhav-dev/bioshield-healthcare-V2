import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/doctor-verifications — list every submission, newest first,
// with the submitting user's name/phone for context in the admin table.
export async function GET() {
  try {
    const verifications = await prisma.doctorVerification.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
    return NextResponse.json({ verifications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load verifications." }, { status: 500 });
  }
}

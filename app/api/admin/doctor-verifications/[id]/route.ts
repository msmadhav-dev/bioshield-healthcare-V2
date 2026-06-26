import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/doctor-verifications/[id]  { status: "APPROVED" | "REJECTED", rejectionReason? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, rejectionReason } = await req.json();

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const verification = await prisma.doctorVerification.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason || "Not specified") : null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ verification });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update verification." }, { status: 500 });
  }
}

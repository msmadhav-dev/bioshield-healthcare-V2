import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "No ID provided" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/productcards/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
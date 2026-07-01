import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { image, linkUrl, order } = await req.json();

    const poster = await prisma.poster.update({
      where: { id },
      data: {
        image:   image !== undefined ? image : undefined,
        linkUrl: linkUrl !== undefined ? (linkUrl || null) : undefined,
        order:   order !== undefined ? Number(order) : undefined,
      },
    });

    return NextResponse.json({ poster });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update poster" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.poster.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete poster" }, { status: 500 });
  }
}
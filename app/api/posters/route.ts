import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posters = await prisma.poster.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ posters });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ posters: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { image, linkUrl, order } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const poster = await prisma.poster.create({
      data: {
        image,
        linkUrl: linkUrl || null,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ poster });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create poster" }, { status: 500 });
  }
}
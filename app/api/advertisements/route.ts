import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const advertisements = await prisma.advertisement.findMany({
      orderBy: { slot: "asc" },
    });
    return NextResponse.json({ advertisements });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ advertisements: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slot, badge, topCaption, heading, subText, productName, image, imageSize } = await req.json();

    if (!heading || !productName) {
      return NextResponse.json({ error: "Heading and product name required" }, { status: 400 });
    }

    const existing = await prisma.advertisement.findFirst({ where: { slot: Number(slot) } });

    let ad;
    if (existing) {
      ad = await prisma.advertisement.update({
        where: { id: existing.id },
        data: { badge: badge || null, topCaption: topCaption || null, heading, subText: subText || null, productName, image: image || null, imageSize: Number(imageSize) || 100 },
      });
    } else {
      ad = await prisma.advertisement.create({
        data: { slot: Number(slot), badge: badge || null, topCaption: topCaption || null, heading, subText: subText || null, productName, image: image || null, imageSize: Number(imageSize) || 100 },
      });
    }

    return NextResponse.json({ ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
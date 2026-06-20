import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "global" } });
    }
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ settings: { freeDeliveryThreshold: 400 } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { freeDeliveryThreshold } = await req.json();
    const settings = await prisma.siteSettings.upsert({
      where:  { id: "global" },
      update: { freeDeliveryThreshold: Number(freeDeliveryThreshold) },
      create: { id: "global", freeDeliveryThreshold: Number(freeDeliveryThreshold) },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
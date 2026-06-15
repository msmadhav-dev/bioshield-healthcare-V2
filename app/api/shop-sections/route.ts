import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.shopSection.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ sections });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sections: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, subtitle, order } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const section = await prisma.shopSection.create({
      data: { name, subtitle: subtitle || null, order: Number(order) || 0 },
    });
    return NextResponse.json({ section });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.posterSectionConfig.findUnique({ where: { id: "global" } });
    if (!config) {
      config = await prisma.posterSectionConfig.create({ data: { id: "global" } });
    }
    return NextResponse.json({ config });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ config: { enabled: false, position: 0 } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { enabled, position } = await req.json();

    const config = await prisma.posterSectionConfig.upsert({
      where:  { id: "global" },
      update: { enabled: !!enabled, position: Number(position) || 0 },
      create: { id: "global", enabled: !!enabled, position: Number(position) || 0 },
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
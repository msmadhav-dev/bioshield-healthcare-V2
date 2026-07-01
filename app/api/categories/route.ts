import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch", categories: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, image, gradientFrom, gradientTo, imageSize } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        image: image || null,
        gradientFrom: gradientFrom || null,
        gradientTo: gradientTo || null,
        imageSize: Number(imageSize) || 68,
      },
    });

    return NextResponse.json({ category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
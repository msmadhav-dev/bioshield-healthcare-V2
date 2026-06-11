import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productcards = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ productcards });
  } catch (err) {
    console.error("GET /api/productcards error:", err);
    return NextResponse.json(
      { error: "Failed to fetch", productcards: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, frontImage, backImage } = await req.json();

    if (!name || !frontImage) {
      return NextResponse.json(
        { error: "Name and front image are required" },
        { status: 400 }
      );
    }

    const card = await prisma.product.create({
      data: {
        name,
        category: category || "general",
        frontImage,
        backImage: backImage || null,
      },
    });

    return NextResponse.json({ card });
  } catch (err) {
    console.error("POST /api/productcards error:", err);
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    );
  }
}
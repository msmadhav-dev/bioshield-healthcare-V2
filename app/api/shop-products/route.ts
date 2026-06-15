import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    const slug      = searchParams.get("slug");

    if (slug) {
      const product = await prisma.shopProduct.findUnique({ where: { slug } });
      if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ product });
    }

    const where = sectionId ? { sectionId } : {};
    const products = await prisma.shopProduct.findMany({
      where,
      orderBy: [{ sectionOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed", products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, offerPrice, badge, badgeColor, mainImage, images,
            categoryId, sectionId, sectionOrder, doctorOffer, productDetails, manufacturerDetails } = body;

    if (!name || !offerPrice || !mainImage) {
      return NextResponse.json({ error: "Name, offer price and main image required" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.shopProduct.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.shopProduct.create({
      data: {
        name, slug,
        price:               price ? Number(price) : null,
        offerPrice:          Number(offerPrice),
        badge:               badge || null,
        badgeColor:          badgeColor || "red",
        mainImage,
        images:              images || [],
        categoryId:          categoryId || null,
        sectionId:           sectionId || null,
        sectionOrder:        Number(sectionOrder) || 0,
        doctorOffer:         doctorOffer || null,
        productDetails:      productDetails || null,
        manufacturerDetails: manufacturerDetails || null,
      },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
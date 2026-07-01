import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

// categoryId is a loose string field (no Prisma relation defined on it), so
// we resolve names with a small lookup map instead of an `include`.
async function withCategoryNames<T extends { categoryId?: string | null }>(items: T[]) {
  const ids = Array.from(new Set(items.map((i) => i.categoryId).filter(Boolean))) as string[];
  if (ids.length === 0) return items.map((i) => ({ ...i, categoryName: null as string | null }));

  const categories = await prisma.category.findMany({ where: { id: { in: ids } } });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  return items.map((i) => ({ ...i, categoryName: i.categoryId ? nameById.get(i.categoryId) || null : null }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");
    const slug      = searchParams.get("slug");
    const ids       = searchParams.get("ids");

    if (slug) {
      const product = await prisma.shopProduct.findUnique({ where: { slug } });
      if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const [withName] = await withCategoryNames([product]);
      return NextResponse.json({ product: withName });
    }

    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const products = await prisma.shopProduct.findMany({ where: { id: { in: idList } } });
      return NextResponse.json({ products: await withCategoryNames(products) });
    }

    const where = sectionId ? { sectionId } : {};
    const products = await prisma.shopProduct.findMany({
      where,
      orderBy: [{ sectionOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ products: await withCategoryNames(products) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed", products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, badge, badgeColor, cardColor, mainImage, images,
      categoryId, sectionId, sectionOrder, doctorOffer,
      productDetailSections, manufacturerDetails,
      unit, availableUnits, stock,
      benefits, productDescription, offers, frequentlyBoughtIds,
      // Pricing — split customer / doctor
      customerMrp, customerOfferPercent,
      doctorMrp, doctorPtrPrice, taxPercent,
      // Delivery weight calc
      productType, weightInGrams, weightUnit,
    } = body;

    if (!name || !customerMrp || !mainImage) {
      return NextResponse.json({ error: "Name, customer MRP, and main image required" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.shopProduct.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.shopProduct.create({
      data: {
        name, slug,
        badge:                badge || null,
        badgeColor:           badgeColor || "red",
        cardColor:            cardColor || "purple",
        mainImage,
        images:               images || [],
        categoryId:           categoryId || null,
        sectionId:            sectionId || null,
        sectionOrder:         Number(sectionOrder) || 0,
        doctorOffer:          doctorOffer || null,
        productDetails:       Array.isArray(productDetailSections) && productDetailSections.length > 0
                                 ? JSON.stringify(productDetailSections)
                                 : null,
        manufacturerDetails:  manufacturerDetails || null,
        unit:                 unit || null,
        availableUnits:       availableUnits || [],
        stock:                stock !== null && stock !== undefined ? Number(stock) : null,
        benefits:             benefits || null,
        productDescription:   productDescription || null,
        offers:               offers || [],
        frequentlyBoughtIds:  frequentlyBoughtIds || [],

        customerMrp:          Number(customerMrp),
        customerOfferPercent: customerOfferPercent !== undefined && customerOfferPercent !== null && customerOfferPercent !== ""
                                 ? Number(customerOfferPercent) : null,
        doctorMrp:            doctorMrp !== undefined && doctorMrp !== null && doctorMrp !== "" ? Number(doctorMrp) : null,
        doctorPtrPrice:       doctorPtrPrice !== undefined && doctorPtrPrice !== null && doctorPtrPrice !== "" ? Number(doctorPtrPrice) : null,
        taxPercent:           taxPercent !== undefined && taxPercent !== null && taxPercent !== "" ? Number(taxPercent) : null,

        productType:          productType || "OTHER",
        weightInGrams:        weightInGrams !== undefined && weightInGrams !== null && weightInGrams !== "" ? Number(weightInGrams) : null,
        weightUnit:           weightUnit || "G",
      },
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
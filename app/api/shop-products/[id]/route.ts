import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.shopProduct.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }  = await params;
    const body    = await req.json();

    const {
      name, price, offerPrice, badge, badgeColor, mainImage, images,
      categoryId, sectionId, sectionOrder, doctorOffer,
      productDetailSections, manufacturerDetails,
      unit, availableUnits, stock,
      benefits, productDescription, offers, frequentlyBoughtIds,
    } = body;

    const updated = await prisma.shopProduct.update({
      where: { id },
      data: {
        name,
        price:               price !== undefined ? (price !== null ? Number(price) : null) : undefined,
        offerPrice:          offerPrice !== undefined ? Number(offerPrice) : undefined,
        badge:               badge !== undefined ? badge : undefined,
        badgeColor:          badgeColor !== undefined ? badgeColor : undefined,
        mainImage:           mainImage !== undefined ? mainImage : undefined,
        images:              images !== undefined ? images : undefined,
        categoryId:          categoryId !== undefined ? categoryId : undefined,
        sectionId:           sectionId !== undefined ? sectionId : undefined,
        sectionOrder:        sectionOrder !== undefined ? Number(sectionOrder) || 0 : undefined,
        doctorOffer:         doctorOffer !== undefined ? doctorOffer : undefined,
        productDetails:      productDetailSections !== undefined
                                ? (Array.isArray(productDetailSections) && productDetailSections.length > 0
                                    ? JSON.stringify(productDetailSections)
                                    : null)
                                : undefined,
        manufacturerDetails: manufacturerDetails !== undefined ? manufacturerDetails : undefined,
        unit:                unit !== undefined ? unit : undefined,
        availableUnits:      availableUnits !== undefined ? availableUnits : undefined,
        stock:               stock !== undefined ? (stock !== null ? Number(stock) : null) : undefined,
        benefits:            benefits !== undefined ? benefits : undefined,
        productDescription:  productDescription !== undefined ? productDescription : undefined,
        offers:              offers !== undefined ? offers : undefined,
        frequentlyBoughtIds: frequentlyBoughtIds !== undefined ? frequentlyBoughtIds : undefined,
      },
    });
    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.shopProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
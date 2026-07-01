import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      slot,
      badge,
      topCaption,
      heading,
      subText,
      productName,
      linkUrl,
      image,
      imageSize,
      imageSizeMobile,
      titleSizeDesktop,
      titleSizeMobile,
      captionSizeDesktop,
      captionSizeMobile,
      buttonSizeDesktop,
      buttonSizeMobile,
      imageOffsetX,
      imageOffsetY,
      imageOffsetXMobile,
      imageOffsetYMobile,
      theme,
      buttonText,
    } = await req.json();

    if (!heading || !productName) {
      return NextResponse.json(
        { error: "Heading and product name required" },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        slot: Number(slot) || 1,
        badge: badge || null,
        topCaption: topCaption || null,
        heading,
        subText: subText || null,
        productName,
        linkUrl: linkUrl || null,
        image: image || null,
        imageSize:          Number(imageSize) || 100,
        imageSizeMobile:    Number(imageSizeMobile) || 100,
        titleSizeDesktop:   Number(titleSizeDesktop) || 100,
        titleSizeMobile:    Number(titleSizeMobile) || 100,
        captionSizeDesktop: Number(captionSizeDesktop) || 100,
        captionSizeMobile:  Number(captionSizeMobile) || 100,
        buttonSizeDesktop:  Number(buttonSizeDesktop) || 100,
        buttonSizeMobile:   Number(buttonSizeMobile) || 100,
        imageOffsetX: Number(imageOffsetX) || 0,
        imageOffsetY: Number(imageOffsetY) || 0,
        imageOffsetXMobile: Number(imageOffsetXMobile) || 0,
        imageOffsetYMobile: Number(imageOffsetYMobile) || 0,
        theme: theme || "orange",
        buttonText: buttonText || "Buy now",
      },
    });

    return NextResponse.json({ ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.advertisement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
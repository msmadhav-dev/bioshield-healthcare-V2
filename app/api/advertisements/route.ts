import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SLOT_DEFAULT_THEMES } from "@/lib/advertisementThemes";

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

    const safeSlot = Number(slot) || 1;
    const safeImageSize = Number(imageSize) || 100;
    const safeTheme = theme || SLOT_DEFAULT_THEMES[safeSlot] || "orange";
    const sizeData = {
      imageSize:          safeImageSize,
      imageSizeMobile:    Number(imageSizeMobile) || 100,
      titleSizeDesktop:   Number(titleSizeDesktop) || 100,
      titleSizeMobile:    Number(titleSizeMobile) || 100,
      captionSizeDesktop: Number(captionSizeDesktop) || 100,
      captionSizeMobile:  Number(captionSizeMobile) || 100,
      buttonSizeDesktop:  Number(buttonSizeDesktop) || 100,
      buttonSizeMobile:   Number(buttonSizeMobile) || 100,
    };

    const existing = await prisma.advertisement.findFirst({
      where: { slot: safeSlot },
    });

    let ad;

    if (existing) {
      ad = await prisma.advertisement.update({
        where: { id: existing.id },
        data: {
          badge: badge || null,
          topCaption: topCaption || null,
          heading,
          subText: subText || null,
          productName,
          linkUrl: linkUrl || null,
          image: image || null,
          ...sizeData,
          imageOffsetX: Number(imageOffsetX) || 0,
          imageOffsetY: Number(imageOffsetY) || 0,
          imageOffsetXMobile: Number(imageOffsetXMobile) || 0,
          imageOffsetYMobile: Number(imageOffsetYMobile) || 0,
          theme: safeTheme,
          buttonText: buttonText || "Buy now",
        },
      });
    } else {
      ad = await prisma.advertisement.create({
        data: {
          slot: safeSlot,
          badge: badge || null,
          topCaption: topCaption || null,
          heading,
          subText: subText || null,
          productName,
          linkUrl: linkUrl || null,
          image: image || null,
          ...sizeData,
          imageOffsetX: Number(imageOffsetX) || 0,
          imageOffsetY: Number(imageOffsetY) || 0,
          imageOffsetXMobile: Number(imageOffsetXMobile) || 0,
          imageOffsetYMobile: Number(imageOffsetYMobile) || 0,
          theme: safeTheme,
          buttonText: buttonText || "Buy now",
        },
      });
    }

    return NextResponse.json({ ad });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
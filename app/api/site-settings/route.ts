import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  deliveryChargePerKg:           30,
  customerFreeDeliveryThreshold: 500,
  doctorFreeDeliveryThreshold:   1000,
};

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: { id: "global", ...DEFAULTS } });
    }
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ settings: DEFAULTS }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { deliveryChargePerKg, customerFreeDeliveryThreshold, doctorFreeDeliveryThreshold } = await req.json();

    const data = {
      deliveryChargePerKg:           Number(deliveryChargePerKg),
      customerFreeDeliveryThreshold: Number(customerFreeDeliveryThreshold),
      doctorFreeDeliveryThreshold:   Number(doctorFreeDeliveryThreshold),
    };

    const settings = await prisma.siteSettings.upsert({
      where:  { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });
    return NextResponse.json({ settings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

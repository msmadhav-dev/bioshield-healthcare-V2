import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  deliveryChargePerKg:           30,
  customerFreeDeliveryThreshold: 500,
  doctorFreeDeliveryThreshold:   1000,
  deliveryCutoffHour:            13,
  deliveryFastDaysMin:           1,
  deliveryFastDaysMax:           2,
  deliverySlowDaysMin:           2,
  deliverySlowDaysMax:           3,
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
    const body = await req.json();
    const data = {
      deliveryChargePerKg:           Number(body.deliveryChargePerKg),
      customerFreeDeliveryThreshold: Number(body.customerFreeDeliveryThreshold),
      doctorFreeDeliveryThreshold:   Number(body.doctorFreeDeliveryThreshold),
      deliveryCutoffHour:            Number(body.deliveryCutoffHour),
      deliveryFastDaysMin:           Number(body.deliveryFastDaysMin),
      deliveryFastDaysMax:           Number(body.deliveryFastDaysMax),
      deliverySlowDaysMin:           Number(body.deliverySlowDaysMin),
      deliverySlowDaysMax:           Number(body.deliverySlowDaysMax),
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";
import {
  getDisplayPrice, getCustomerPricing, getDoctorPricing,
  lineItemWeightGrams, calculateDeliveryFee, calculateDoctorTax,
  getDeliveryEstimate, getCouponDiscount,
} from "@/lib/pricing";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET /api/cart — full cart with computed pricing, weight, delivery fee,
// per-item MRP/discount breakdown, applied coupon, default address, and
// (for doctors) combined tax — all calculated server-side.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const [user, settings, items, addresses] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.siteSettings.findUnique({ where: { id: "global" } }),
      prisma.cartItem.findMany({
        where: { userId },
        include: { shopProduct: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    ]);

    const role = user?.role as "CUSTOMER" | "DOCTOR" | undefined;
    const ds = settings || {
      deliveryChargePerKg: 30, customerFreeDeliveryThreshold: 500, doctorFreeDeliveryThreshold: 1000,
      deliveryCutoffHour: 13, deliveryFastDaysMin: 1, deliveryFastDaysMax: 2,
      deliverySlowDaysMin: 2, deliverySlowDaysMax: 3,
    };
    const isDoctor = role === "DOCTOR";

    let mrpTotal = 0;
    let itemDiscountTotal = 0;
    let totalWeightGrams = 0;

    const lines = items.map((item) => {
      const p = item.shopProduct;
      const customerPricing = getCustomerPricing(p);
      const doctorPricing   = getDoctorPricing(p);

      const mrp       = isDoctor ? doctorPricing.mrp : customerPricing.mrp;
      const unitPrice = isDoctor ? doctorPricing.ptr : customerPricing.offerPrice;
      const lineMrp      = mrp * item.quantity;
      const lineTotal     = unitPrice * item.quantity;
      const lineDiscount  = lineMrp - lineTotal;
      const discountPercent = isDoctor
        ? (mrp > 0 ? Math.round(((mrp - unitPrice) / mrp) * 100) : 0)
        : (p.customerOfferPercent || 0);

      mrpTotal          += lineMrp;
      itemDiscountTotal += lineDiscount;
      totalWeightGrams  += lineItemWeightGrams(p, item.quantity);

      return {
        id:           item.id,
        quantity:     item.quantity,
        selectedUnit: item.selectedUnit,
        unitPrice,
        lineTotal,
        lineMrp,
        lineDiscount,
        discountPercent,
        product: {
          id: p.id, name: p.name, slug: p.slug, mainImage: p.mainImage,
          unit: p.unit, availableUnits: p.availableUnits, stock: p.stock,
          customerPricing, doctorPricing,
        },
      };
    });

    const subtotalAfterMrpDiscount = mrpTotal - itemDiscountTotal; // == sum of lineTotal

    const couponCode     = user?.appliedCouponCode || null;
    const couponDiscount = getCouponDiscount(couponCode, subtotalAfterMrpDiscount);
    const discountedValue = subtotalAfterMrpDiscount - couponDiscount;

    const { fee: deliveryFee, isFree: freeDelivery } = calculateDeliveryFee(totalWeightGrams, discountedValue, role, ds);
    const tax = isDoctor
      ? calculateDoctorTax(items.map((i) => ({ product: i.shopProduct, quantity: i.quantity })))
      : 0;

    const freeDeliveryThreshold = isDoctor ? ds.doctorFreeDeliveryThreshold : ds.customerFreeDeliveryThreshold;
    const amountToFreeDelivery  = Math.max(0, freeDeliveryThreshold - discountedValue);

    const deliveryEstimate = getDeliveryEstimate(ds);
    const defaultAddress   = addresses.find((a) => a.isDefault) || null;

    return NextResponse.json({
      items: lines,
      mrpTotal,
      itemDiscountTotal,
      subtotalAfterMrpDiscount,
      couponCode,
      couponDiscount,
      discountedValue,
      totalWeightGrams,
      deliveryFee,
      freeDelivery,
      freeDeliveryThreshold,
      amountToFreeDelivery,
      tax,
      total: discountedValue + deliveryFee + tax,
      role: role || "CUSTOMER",
      deliveryEstimate: deliveryEstimate.text,
      defaultAddress,
      addresses,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load cart." }, { status: 500 });
  }
}

// POST /api/cart  { shopProductId, selectedUnit?, quantity? }
// Adds an item, or increments quantity if the same product+unit is already in the cart.
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const { shopProductId, selectedUnit, quantity } = await req.json();
    if (!shopProductId) return NextResponse.json({ error: "Product is required." }, { status: 400 });

    const qty = Math.max(1, Number(quantity) || 1);
    const unit = selectedUnit || null;

    const existing = await prisma.cartItem.findFirst({
      where: { userId, shopProductId, selectedUnit: unit },
    });

    const item = existing
      ? await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + qty } })
      : await prisma.cartItem.create({ data: { userId, shopProductId, selectedUnit: unit, quantity: qty } });

    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add to cart." }, { status: 500 });
  }
}

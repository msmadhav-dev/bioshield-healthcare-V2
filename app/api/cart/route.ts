import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/sessionToken";
import {
  getDisplayPrice, getCustomerPricing, getDoctorPricing,
  lineItemWeightGrams, calculateDeliveryFee, calculateDoctorTax,
} from "@/lib/pricing";

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

// GET /api/cart — full cart with computed pricing, weight, delivery fee, and
// (for doctors) combined tax, all calculated server-side so the client never
// has to duplicate this math.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  try {
    const [user, settings, items] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.siteSettings.findUnique({ where: { id: "global" } }),
      prisma.cartItem.findMany({
        where: { userId },
        include: { shopProduct: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const role = user?.role as "CUSTOMER" | "DOCTOR" | undefined;
    const ds = settings || { deliveryChargePerKg: 30, customerFreeDeliveryThreshold: 500, doctorFreeDeliveryThreshold: 1000 };

    let subtotal = 0;
    let totalWeightGrams = 0;

    const lines = items.map((item) => {
      const p = item.shopProduct;
      const unitPrice = getDisplayPrice(p, role);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      totalWeightGrams += lineItemWeightGrams(p, item.quantity);

      return {
        id:           item.id,
        quantity:     item.quantity,
        selectedUnit: item.selectedUnit,
        unitPrice,
        lineTotal,
        product: {
          id: p.id, name: p.name, slug: p.slug, mainImage: p.mainImage,
          unit: p.unit, availableUnits: p.availableUnits,
          customerPricing: getCustomerPricing(p),
          doctorPricing:   getDoctorPricing(p),
        },
      };
    });

    const { fee: deliveryFee, isFree: freeDelivery } = calculateDeliveryFee(totalWeightGrams, subtotal, role, ds);
    const tax = role === "DOCTOR"
      ? calculateDoctorTax(items.map((i) => ({ product: i.shopProduct, quantity: i.quantity })))
      : 0;

    return NextResponse.json({
      items: lines,
      subtotal,
      totalWeightGrams,
      deliveryFee,
      freeDelivery,
      tax,
      total: subtotal + deliveryFee + tax,
      role: role || "CUSTOMER",
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

// Shared pricing/delivery math. Keeping this in one place so the cart API
// and the cart page UI can never drift out of sync with each other.

// Converts an admin-entered weight value to canonical grams. Liters need
// converting (1L = 1000g equivalent); grams and ml are already 1:1 for our
// purposes, so they pass through unchanged.
export function convertToGrams(value: number, unit: "G" | "ML" | "L"): number {
  if (unit === "L") return value * 1000;
  return value;
}

// Reverse of the above — used when re-loading a product into the edit form,
// so the admin sees the value back in whichever unit they originally entered.
export function gramsToDisplayValue(grams: number, unit: "G" | "ML" | "L"): number {
  if (unit === "L") return grams / 1000;
  return grams;
}

export type DeliveryTimingSettings = {
  deliveryCutoffHour:  number; // 24h format, e.g. 13 = 1pm
  deliveryFastDaysMin: number;
  deliveryFastDaysMax: number;
  deliverySlowDaysMin: number;
  deliverySlowDaysMax: number;
};

// Orders placed before the cutoff hour get the faster estimate; after it,
// the slower one. Returns both the day range and a ready-to-display string.
export function getDeliveryEstimate(settings: DeliveryTimingSettings, now: Date = new Date()) {
  const beforeCutoff = now.getHours() < settings.deliveryCutoffHour;
  const min = beforeCutoff ? settings.deliveryFastDaysMin : settings.deliverySlowDaysMin;
  const max = beforeCutoff ? settings.deliveryFastDaysMax : settings.deliverySlowDaysMax;
  return {
    minDays: min,
    maxDays: max,
    text: min === max ? `${min} day${min > 1 ? "s" : ""}` : `${min}-${max} days`,
  };
}

// Hardcoded for now — referral/cashback system will replace this later.
// Coupon gives a flat % off the subtotal that's already been MRP-discounted.
export const VALID_COUPONS: Record<string, { percent: number }> = {
  BS0708CARE: { percent: 5 },
};

export function getCouponDiscount(code: string | null | undefined, discountedSubtotal: number): number {
  if (!code) return 0;
  const coupon = VALID_COUPONS[code.toUpperCase()];
  if (!coupon) return 0;
  return discountedSubtotal * (coupon.percent / 100);
}

export type Role = "CUSTOMER" | "DOCTOR";

export type PricedProduct = {
  customerMrp: number;
  customerOfferPercent?: number | null;
  doctorMrp?: number | null;
  doctorPtrPrice?: number | null;
  taxPercent?: number | null;
  productType: string; // "TABLET" | "GEL" | "SYRUP" | "OTHER"
  weightInGrams?: number | null;
};

// The price the customer actually pays. If no offer % is set, returns the
// MRP twice (struck-through + same value) for the "customer attraction" effect.
export function getCustomerPricing(p: PricedProduct) {
  const mrp = p.customerMrp;
  const hasOffer = !!p.customerOfferPercent && p.customerOfferPercent > 0;
  const offerPrice = hasOffer ? mrp * (1 - p.customerOfferPercent! / 100) : mrp;
  return { mrp, offerPrice, hasOffer };
}

// The price a doctor pays — always MRP struck-through, PTR shown as the real price.
// Falls back to customer pricing if doctor-specific pricing was never set on this product.
export function getDoctorPricing(p: PricedProduct) {
  const mrp = p.doctorMrp ?? p.customerMrp;
  const ptr = p.doctorPtrPrice ?? getCustomerPricing(p).offerPrice;
  return { mrp, ptr };
}

// The price to use for "what does this user pay", based on role.
export function getDisplayPrice(p: PricedProduct, role: Role | null | undefined) {
  if (role === "DOCTOR") {
    const { ptr } = getDoctorPricing(p);
    return ptr;
  }
  return getCustomerPricing(p).offerPrice;
}

// Weight this single line item contributes to the cart's total delivery
// weight. Tablets are excluded entirely (counted by strip/box, not weight).
export function lineItemWeightGrams(p: PricedProduct, quantity: number): number {
  if (p.productType === "TABLET") return 0;
  return (p.weightInGrams || 0) * quantity;
}

export type DeliverySettings = {
  deliveryChargePerKg: number;
  customerFreeDeliveryThreshold: number;
  doctorFreeDeliveryThreshold: number;
};

// Delivery fee for the whole cart: total weight rounds UP to the next kg,
// charged at the per-kg rate — unless the subtotal clears the role's free
// delivery threshold, in which case it's free regardless of weight.
export function calculateDeliveryFee(
  totalWeightGrams: number,
  subtotal: number,
  role: Role | null | undefined,
  settings: DeliverySettings
): { fee: number; isFree: boolean } {
  const threshold = role === "DOCTOR" ? settings.doctorFreeDeliveryThreshold : settings.customerFreeDeliveryThreshold;
  if (subtotal >= threshold) return { fee: 0, isFree: true };

  if (totalWeightGrams <= 0) return { fee: 0, isFree: true };

  const weightKg = totalWeightGrams / 1000;
  const roundedKg = Math.ceil(weightKg);
  return { fee: roundedKg * settings.deliveryChargePerKg, isFree: false };
}

// Combined tax across the whole cart — doctors only. Each line's tax is
// taxPercent% of (PTR price × quantity); all lines are summed into one figure.
export function calculateDoctorTax(
  items: { product: PricedProduct; quantity: number }[]
): number {
  return items.reduce((sum, { product, quantity }) => {
    if (!product.taxPercent) return sum;
    const { ptr } = getDoctorPricing(product);
    return sum + ptr * quantity * (product.taxPercent / 100);
  }, 0);
}

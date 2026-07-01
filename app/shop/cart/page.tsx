"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Trash2, Loader2, ShoppingBag, Zap, ArrowRight } from "lucide-react";
import AccountPageShell from "@/components/account/AccountPageShell";
import SelectAddressModal from "@/components/account/SelectAddressModal";

const GREEN = "#14532D";
const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";
const MAX_QTY = 50;

type CartLine = {
  id: string; quantity: number; selectedUnit?: string | null;
  unitPrice: number; lineTotal: number; lineMrp: number; lineDiscount: number; discountPercent: number;
  product: {
    id: string; name: string; slug: string; mainImage: string;
    unit?: string | null; availableUnits?: string[]; stock?: number | null;
    customerPricing: { mrp: number; offerPrice: number; hasOffer: boolean };
    doctorPricing:   { mrp: number; ptr: number };
  };
};

type Address = {
  id: string; label: string; doorNo: string; street: string;
  cityTown: string; pincode: string; district: string; state: string; isDefault: boolean;
};

type CartData = {
  items: CartLine[];
  mrpTotal: number; itemDiscountTotal: number; subtotalAfterMrpDiscount: number;
  couponCode: string | null; couponDiscount: number; discountedValue: number;
  totalWeightGrams: number;
  deliveryFee: number; freeDelivery: boolean; freeDeliveryThreshold: number; amountToFreeDelivery: number;
  tax: number; total: number; role: "CUSTOMER" | "DOCTOR"; deliveryEstimate: string;
  defaultAddress: Address | null; addresses: Address[];
};

function QtySelect({
  value, max, onChange, onRemove, disabled,
}: {
  value: number; max: number; onChange: (v: number) => void; onRemove: () => void; disabled?: boolean;
}) {
  const options = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="relative rounded-full" style={{ border: "1px solid #E0E0E5" }}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === "remove") onRemove();
          else onChange(Number(e.target.value));
        }}
        className="appearance-none bg-transparent pl-4 pr-8 py-1.5 text-[13px] font-bold text-black outline-none cursor-pointer"
      >
        <option value="remove">Remove Item</option>
        {options.map((n) => <option key={n} value={n}>Qty {n}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 10 10">
        <path d="M1 3L5 7L9 3" stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CartContent() {
  const router = useRouter();
  const [cart,    setCart]    = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const loadCart = useCallback(() => {
    setLoading(true);
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCart(d.items ? d : null))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const updateQuantity = async (id: string, quantity: number) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/cart/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ quantity }),
      });
      loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/cart/${id}`, { method: "DELETE" });
      loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const res  = await fetch("/api/cart/coupon", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: couponInput.trim() }),
      });
      const data = await res.json();
      if (data.success) { setCouponInput(""); loadCart(); }
      else setCouponError(data.error || "Invalid coupon code.");
    } catch {
      setCouponError("Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async () => {
    await fetch("/api/cart/coupon", { method: "DELETE" });
    loadCart();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={22} className="animate-spin text-gray-400" /></div>;
  }

  const itemCount = cart?.items.length || 0;
  const isDoctor  = cart?.role === "DOCTOR";

  return (
    <div className="px-4 md:px-8 py-6 overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
        <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
        <ChevronRight size={11} />
        <span className="text-gray-900 font-medium">Cart</span>
      </div>

      {/* Header texts — plain on the page background, no white box. Wrapped in
          the same grid as below so "View Liked Products" lines up with the
          right edge of the left column specifically, not the full page. */}
      <div className="grid md:grid-cols-[1fr_420px] gap-6 mb-4">
        <div className="flex items-center justify-between min-w-0 gap-3">
          <p className="text-[22px] md:text-[26px] font-extrabold text-gray-900">
            {itemCount} {itemCount === 1 ? "Item" : "Items"} in your Cart
          </p>
          <Link href="/shop/account/liked" className="inline-flex items-center gap-1.5 flex-shrink-0">
            <img src="/icons/heart.svg" alt="" style={{ width: 15, height: 15 }} />
            <span className="text-[13px] font-bold" style={{ color: GREEN }}>View Liked Products</span>
          </Link>
        </div>
        <div className="hidden md:block" />
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-[16px] font-bold text-gray-900 mb-1">Your cart is empty</p>
          <p className="text-[13px] text-gray-500 mb-5">Browse the shop and add something you like.</p>
          <Link href="/shop" className="px-6 py-2.5 rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: GREEN }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_420px] gap-6">

          {/* ── Cart items ── */}
          <div className="min-w-0">
            {/* Delivery address — confined to this column's width, not full-page */}
            <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
              {cart?.defaultAddress ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <img src="/icons/location.svg" alt="" style={{ width: 18, height: 18, marginTop: "2px" }} className="flex-shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-black">
                        Deliver to {cart.defaultAddress.label} ({cart.defaultAddress.pincode})
                      </p>
                      <p className="text-[12.5px] text-gray-500 mt-0.5">
                        {cart.defaultAddress.doorNo}, {cart.defaultAddress.street} {cart.defaultAddress.cityTown}, {cart.defaultAddress.district}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAddressModalOpen(true)} className="text-[13px] font-bold flex-shrink-0" style={{ color: GREEN }}>
                    Change Address
                  </button>
                </div>
              ) : (
                <button
                  type="button" onClick={() => setAddressModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 text-[14px] font-bold"
                  style={{ color: GREEN }}
                >
                  <img src="/icons/location.svg" alt="" style={{ width: 18, height: 18 }} />
                  Add Delivery Address
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cart.items.map((item) => {
                const mrp   = isDoctor ? item.product.doctorPricing.mrp : item.product.customerPricing.mrp;
                const price = isDoctor ? item.product.doctorPricing.ptr : item.product.customerPricing.offerPrice;
                const max   = Math.max(1, Math.min(MAX_QTY, item.product.stock ?? MAX_QTY));

                return (
                  <div key={item.id} className="rounded-lg p-4 relative" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
                    <button
                      type="button" onClick={() => removeItem(item.id)} disabled={updatingId === item.id}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-start gap-4 pr-8">
                      <Link href={`/shop/products/${item.product.slug}`} className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <img src={item.product.mainImage} alt={item.product.name} style={{ width: "85%", height: "85%", objectFit: "contain", mixBlendMode: "multiply" }} />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/products/${item.product.slug}`}>
                          <p className="text-[14.5px] font-bold text-black leading-snug">{item.product.name}</p>
                        </Link>
                        {(item.selectedUnit || item.product.unit) && (
                          <p className="text-[12.5px] text-gray-500 mt-0.5">{item.selectedUnit || item.product.unit}</p>
                        )}

                        <div className="flex items-baseline gap-2 mt-2">
                          {mrp > price && <span className="text-[12.5px] text-gray-400 line-through">₹{mrp.toFixed(2)}</span>}
                          <span className="text-[16px] font-extrabold text-black">₹{price.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <Zap size={13} style={{ color: "#F59E0B" }} fill="#F59E0B" />
                            Delivery in <span className="font-bold text-gray-700">{cart.deliveryEstimate}</span>
                          </div>

                          <QtySelect
                            value={item.quantity}
                            max={max}
                            disabled={updatingId === item.id}
                            onChange={(q) => updateQuantity(item.id, q)}
                            onRemove={() => removeItem(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Net weight */}
            <p className="text-[12.5px] text-gray-500 mt-4">
              Net Weight: <span className="font-semibold text-black">
                {cart.totalWeightGrams > 0 ? `${(cart.totalWeightGrams / 1000).toFixed(2)} kg` : "0 kg (tablets only)"}
              </span>
            </p>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-4 min-w-0">

            {/* Cart total + Proceed button + Coupons & Offers — one unified card */}
            <div className="rounded-lg p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
              <p className="text-[13px] text-gray-500 mb-1">Cart total: <span className="text-[20px] font-extrabold text-black">₹{cart.total.toFixed(2)}</span></p>

              <button
                type="button"
                onClick={() => { if (!cart.defaultAddress) setAddressModalOpen(true); else router.push("/shop/checkout"); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-bold text-white mt-3"
                style={{ backgroundColor: GREEN }}
              >
                {cart.defaultAddress ? "Proceed to Checkout" : "Proceed To Buy"} <ArrowRight size={16} />
              </button>

              {/* Divider with centered label */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #D1D5DB)" }} />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Coupons &amp; Offers</span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #D1D5DB)" }} />
              </div>

              {!cart.couponCode ? (
                <>
                  <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ border: "1px solid #E0E0E5", backgroundColor: "#FAFAFA" }}>
                    <img src="/icons/coupon.svg" alt="" style={{ width: 20, height: 20 }} className="flex-shrink-0" />
                    <input
                      value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-transparent text-[13px] outline-none text-black placeholder-gray-400"
                    />
                    <button
                      type="button" onClick={applyCoupon} disabled={couponLoading}
                      className="px-4 py-1.5 rounded-lg text-[12.5px] font-bold flex-shrink-0"
                      style={{ background: YELLOW_GRADIENT, color: "#1A1A1A" }}
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[12px] mt-2" style={{ color: "#DC2626" }}>{couponError}</p>}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#F4F4F5" }}>
                  <div className="flex items-center gap-2.5">
                    <img src="/icons/coupon.svg" alt="" style={{ width: 22, height: 22 }} />
                    <div>
                      <p className="text-[13px] font-bold text-black">{cart.couponCode}</p>
                      <p className="text-[12px] text-black">Saved ₹{cart.couponDiscount.toFixed(2)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-[12px] font-bold underline text-black">
                    Remove
                  </button>
                </div>
              )}

              <button type="button" className="block w-full text-center mt-4 text-[12px] font-semibold underline text-gray-500">
                Refer a friend &amp; grab coupons
              </button>
            </div>

            {/* Order Summary — scalloped top edge */}
            <div>
              <div
                style={{
                  height: "14px",
                  backgroundImage: "radial-gradient(circle at 7px 0, transparent 7px, #FFFFFF 7.5px)",
                  backgroundSize: "14px 14px",
                  backgroundRepeat: "repeat-x",
                  borderLeft: "1px solid #EFEFEF",
                  borderRight: "1px solid #EFEFEF",
                }}
              />
              <div className="rounded-b-lg p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF", borderTop: "none" }}>
                <h2 className="text-[16px] font-extrabold mb-4" style={{ color: GREEN }}>Order Summary</h2>

                {/* Per-item MRP */}
                <div className="space-y-1.5 mb-3 pb-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <p className="text-[12.5px] text-gray-600 flex-1 min-w-0 truncate">{item.product.name} × {item.quantity}</p>
                      <p className="text-[12.5px] font-semibold text-black flex-shrink-0">₹{item.lineMrp.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Per-item discount */}
                {(cart.itemDiscountTotal > 0 || cart.couponDiscount > 0) && (
                  <div className="space-y-1.5 mb-3 pb-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
                    {cart.items.filter((i) => i.lineDiscount > 0.001).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-3">
                        <p className="text-[12.5px] text-gray-600 flex-1 min-w-0 truncate">
                          {item.product.name} ({item.discountPercent}% off)
                        </p>
                        <p className="text-[12.5px] font-semibold flex-shrink-0" style={{ color: GREEN }}>-₹{item.lineDiscount.toFixed(2)}</p>
                      </div>
                    ))}
                    {cart.couponDiscount > 0 && (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12.5px] text-gray-600 flex-1">Coupon discount ({cart.couponCode})</p>
                        <p className="text-[12.5px] font-semibold flex-shrink-0" style={{ color: GREEN }}>-₹{cart.couponDiscount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
                  <p className="text-[13px] font-bold text-black">Discounted Value</p>
                  <p className="text-[13px] font-bold text-black">₹{cart.discountedValue.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src="/icons/truck.svg" alt="" style={{ width: 16, height: 16 }} />
                    <p className="text-[13px] text-gray-600">Delivery Fee</p>
                  </div>
                  {cart.freeDelivery ? (
                    <p className="text-[13px] font-bold" style={{ color: GREEN }}>Free Delivery</p>
                  ) : (
                    <p className="text-[13px] font-semibold text-black">₹{cart.deliveryFee.toFixed(2)}</p>
                  )}
                </div>

                {!cart.freeDelivery && (
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                    <img src="/icons/truck.svg" alt="" style={{ width: 28, height: 28 }} className="flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12.5px] font-bold text-black">Free delivery above ₹{cart.freeDeliveryThreshold.toFixed(0)}</p>
                      <p className="text-[11.5px] text-gray-500">Shop for extra ₹{cart.amountToFreeDelivery.toFixed(0)} and grab free delivery!</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-1 pt-2" style={{ borderTop: "1px solid #F0F0F0" }}>
                  <p className="text-[15px] font-extrabold text-black">Total</p>
                  <p className="text-[19px] font-extrabold text-black">₹{cart.total.toFixed(2)}</p>
                </div>

                {isDoctor && cart.tax > 0 && (
                  <p className="text-[12px] text-gray-500">Includes ₹{cart.tax.toFixed(2)} tax</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {addressModalOpen && (
        <SelectAddressModal
          addresses={cart?.addresses || []}
          onClose={() => setAddressModalOpen(false)}
          onSelected={loadCart}
        />
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <AccountPageShell bgColor="#FFFFFF">
      <CartContent />
    </AccountPageShell>
  );
}

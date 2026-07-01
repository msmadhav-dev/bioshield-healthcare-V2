"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

const GREEN = "#14532D";
const PURPLE = "#4C1D95";

type CartData = {
  mrpTotal: number; itemDiscountTotal: number; couponDiscount: number;
  discountedValue: number; deliveryFee: number; freeDelivery: boolean;
  tax: number; total: number; role: "CUSTOMER" | "DOCTOR";
};

const OTHER_OPTIONS = [
  { label: "Credit/Debit Card", icon: "/icons/card.svg" },
  { label: "Wallets",            icon: "/icons/wallets.svg" },
  { label: "Net Banking",        icon: "/icons/netbanking.svg" },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"upi" | string>("upi");

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => setCart(d.total !== undefined ? d : null))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-[100px] md:pt-[68px] flex items-center justify-center" style={{ minHeight: "100vh" }}>
        <Loader2 size={22} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const totalDiscount = (cart?.itemDiscountTotal || 0) + (cart?.couponDiscount || 0);
  const isDoctor = cart?.role === "DOCTOR";

  return (
    <div className="pt-[100px] md:pt-[68px]" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <div className="mx-auto px-4 md:px-8 py-6" style={{ maxWidth: "1200px" }}>

        {/* Amount Payable bar */}
        <button type="button" className="w-full flex items-center justify-between rounded-xl px-5 py-4 mb-6" style={{ backgroundColor: "#F5F0FF" }}>
          <p className="text-[14px] text-gray-700">
            Amount Payable <span className="text-[16px] font-extrabold text-black ml-1">₹{(cart?.total || 0).toFixed(2)}</span>
          </p>
          <ChevronRight size={18} className="text-gray-500" />
        </button>

        <div className="grid md:grid-cols-[1fr_380px] gap-6">

          {/* ── Payment Options ── */}
          <div className="min-w-0">
            <h1 className="text-[19px] font-extrabold text-gray-900 mb-4">Payment Options</h1>

            {/* Big UPI box */}
            <div
              className="rounded-2xl p-6 mb-4 cursor-pointer transition-all"
              style={{ border: `2px solid ${method === "upi" ? PURPLE : "#EFEFEF"}`, backgroundColor: "#FFFFFF" }}
              onClick={() => setMethod("upi")}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-gray-400 mb-1">UPI</p>
                  <p className="text-[16px] font-extrabold text-black">Scan &amp; Pay by any UPI app</p>
                  <p className="text-[13px] text-gray-500 mt-1.5 max-w-[360px]">
                    Scan the QR using any UPI app on your mobile phone like PhonePe, Paytm, Google Pay, BHIM, etc.
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ border: `2px solid ${method === "upi" ? PURPLE : "#D1D5DB"}` }}
                >
                  {method === "upi" && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PURPLE }} />}
                </div>
              </div>

              <img src="/upi.jpg" alt="Pay via UPI" className="w-full rounded-xl mb-5" style={{ maxHeight: "180px", objectFit: "contain" }} />

              <button
                type="button"
                className="w-full py-3.5 rounded-full text-[14px] font-bold text-white transition-colors"
                style={{ backgroundColor: GREEN }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F3D21")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
              >
                Place Order &amp; Generate QR Code
              </button>
            </div>

            {/* Other options */}
            <div className="rounded-2xl" style={{ border: "1px solid #EFEFEF", backgroundColor: "#FFFFFF" }}>
              <p className="text-[15px] font-extrabold text-gray-900 px-5 pt-5 pb-3">Other options</p>
              {OTHER_OPTIONS.map((opt, i) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMethod(opt.label)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  style={{ borderTop: i > 0 ? "1px dashed #E5E7EB" : "none" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F0FDF4" }}>
                      <img src={opt.icon} alt="" style={{ width: 20, height: 20 }} />
                    </div>
                    <p className="text-[14px] font-bold text-black">{opt.label}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Bill Summary ── */}
          <div className="min-w-0">
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
            <div className="rounded-b-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF", borderTop: "none" }}>
              <h2 className="text-[16px] font-extrabold mb-4" style={{ color: GREEN }}>Bill Summary</h2>

              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[13px] text-gray-600">MRP</p>
                <p className="text-[13px] font-semibold text-black">₹{(cart?.mrpTotal || 0).toFixed(2)}</p>
              </div>

              {totalDiscount > 0 && (
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13px] text-gray-600 underline">Discount</p>
                  <p className="text-[13px] font-semibold" style={{ color: GREEN }}>-₹{totalDiscount.toFixed(2)}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
                <p className="text-[13px] font-bold text-black">Discounted Value</p>
                <p className="text-[13px] font-bold text-black">₹{(cart?.discountedValue || 0).toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[13px] text-gray-600 underline">Delivery Fee</p>
                {cart?.freeDelivery ? (
                  <p className="text-[13px] font-bold" style={{ color: GREEN }}>Free</p>
                ) : (
                  <p className="text-[13px] font-semibold text-black">₹{(cart?.deliveryFee || 0).toFixed(2)}</p>
                )}
              </div>

              {isDoctor && cart && cart.tax > 0 && (
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13px] text-gray-600">Tax</p>
                  <p className="text-[13px] font-semibold text-black">₹{cart.tax.toFixed(2)}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
                <p className="text-[15px] font-extrabold text-black">Amount to be paid</p>
                <p className="text-[18px] font-extrabold text-black">₹{(cart?.total || 0).toFixed(2)}</p>
              </div>
            </div>

            {totalDiscount > 0 && (
              <div
                className="flex items-center justify-between gap-2 rounded-b-2xl px-5 py-3.5 mt-[-1px]"
                style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #1B6B3A 100%)` }}
              >
                <div className="flex items-center gap-2">
                  <img src="/icons/coupon.svg" alt="" style={{ width: 18, height: 18 }} />
                  <p className="text-[13px] font-bold text-white">₹{totalDiscount.toFixed(2)} Saved on this order</p>
                </div>
                <ChevronRight size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

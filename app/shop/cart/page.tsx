"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import AccountPageShell from "@/components/account/AccountPageShell";

const GREEN = "#14532D";

type CartLine = {
  id: string; quantity: number; selectedUnit?: string | null;
  unitPrice: number; lineTotal: number;
  product: {
    id: string; name: string; slug: string; mainImage: string;
    unit?: string | null; availableUnits?: string[];
  };
};

type CartData = {
  items: CartLine[]; subtotal: number; totalWeightGrams: number;
  deliveryFee: number; freeDelivery: boolean; tax: number; total: number;
  role: "CUSTOMER" | "DOCTOR";
};

function CartContent() {
  const [cart,    setCart]    = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    if (quantity < 1) return;
    setUpdatingId(id);
    try {
      await fetch(`/api/cart/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ quantity }),
      });
      await new Promise((r) => fetch("/api/cart").then((res) => res.json()).then((d) => { setCart(d.items ? d : null); r(null); }));
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

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={22} className="animate-spin text-gray-400" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
        <p className="text-[16px] font-bold text-gray-900 mb-1">Your cart is empty</p>
        <p className="text-[13px] text-gray-500 mb-5">Browse the shop and add something you like.</p>
        <Link href="/shop" className="px-6 py-2.5 rounded-full text-[13px] font-bold text-white" style={{ backgroundColor: GREEN }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isDoctor = cart.role === "DOCTOR";
  const weightKg = cart.totalWeightGrams / 1000;

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-3">
        <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
        <ChevronRight size={11} />
        <span className="text-gray-900 font-medium">Cart</span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-extrabold mb-6" style={{ color: GREEN }}>Your Cart</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">

        {/* ── Cart items ── */}
        <div>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
            {cart.items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-5"
                style={{ borderBottom: i < cart.items.length - 1 ? "1px solid #F0F0F0" : "none" }}
              >
                <Link href={`/shop/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                    <img src={item.product.mainImage} alt={item.product.name} style={{ width: "85%", height: "85%", objectFit: "contain", mixBlendMode: "multiply" }} />
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/shop/products/${item.product.slug}`}>
                      <p className="text-[14px] font-bold text-black leading-snug">{item.product.name}</p>
                    </Link>
                    <button
                      type="button" onClick={() => removeItem(item.id)} disabled={updatingId === item.id}
                      className="flex-shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.selectedUnit && (
                    <p className="text-[12px] text-gray-500 mt-0.5">Size: {item.selectedUnit}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[15px] font-extrabold text-black">
                      ₹{item.unitPrice.toFixed(0)}
                      <span className="text-[12px] text-gray-400 font-normal"> × {item.quantity}</span>
                    </p>

                    <div className="flex items-center gap-3 rounded-full px-1" style={{ border: "1px solid #E0E0E5" }}>
                      <button
                        type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-[13px] font-bold text-black w-5 text-center">{item.quantity}</span>
                      <button
                        type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Net weight */}
          <p className="text-[12.5px] text-gray-500 mt-4">
            Net Weight: <span className="font-semibold text-black">{weightKg > 0 ? `${weightKg.toFixed(2)} kg` : "0 kg (tablets only)"}</span>
          </p>
        </div>

        {/* ── Order Summary ── */}
        <div className="rounded-3xl p-6 h-fit" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
          <h2 className="text-[16px] font-extrabold mb-4" style={{ color: GREEN }}>Order Summary</h2>

          <div className="space-y-2 mb-4 pb-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <p className="text-[12.5px] text-gray-600 flex-1 truncate">{item.product.name} × {item.quantity}</p>
                <p className="text-[12.5px] font-semibold text-black flex-shrink-0">₹{item.lineTotal.toFixed(0)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 mb-4 pb-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-gray-600">Subtotal</p>
              <p className="text-[13px] font-semibold text-black">₹{cart.subtotal.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-gray-600">Delivery Fee</p>
              {cart.freeDelivery ? (
                <p className="text-[13px] font-bold" style={{ color: GREEN }}>Free Delivery</p>
              ) : (
                <p className="text-[13px] font-semibold text-black">₹{cart.deliveryFee.toFixed(0)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <p className="text-[15px] font-extrabold text-black">Total</p>
            <p className="text-[18px] font-extrabold text-black">₹{(cart.subtotal + cart.deliveryFee).toFixed(0)}</p>
          </div>

          {isDoctor && cart.tax > 0 && (
            <p className="text-[12px] text-gray-500 mb-4">+ ₹{cart.tax.toFixed(0)} tax calculated at checkout</p>
          )}

          <button
            type="button"
            className="w-full mt-3 py-3.5 rounded-full text-[14px] font-bold text-white transition-colors"
            style={{ backgroundColor: GREEN }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F3D21")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GREEN)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AccountPageShell>
      <CartContent />
    </AccountPageShell>
  );
}

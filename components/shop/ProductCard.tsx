"use client";

import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart } from "lucide-react";

export type ShopProductType = {
  id: string; name: string; slug: string;
  price?: number | null; offerPrice: number;
  badge?: string | null; badgeColor: string; mainImage: string;
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  red:  { bg: "#FEE2E2", color: "#DC2626" },
  blue: { bg: "#DBEAFE", color: "#2563EB" },
  pink: { bg: "#FCE7F3", color: "#DB2777" },
};

export default function ProductCard({ product }: { product: ShopProductType }) {
  const router   = useRouter();
  const badge    = product.badge ? (BADGE_COLORS[product.badgeColor] || BADGE_COLORS.red) : null;
  const discount = product.price && product.offerPrice < product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : null;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        width:           "clamp(160px, 18vw, 210px)",
        backgroundColor: "#FFFFFF",
        border:          "1px solid #EBEBEB",
        boxShadow:       "0 2px 8px rgba(0,0,0,0.04)",
        transition:      "box-shadow 0.2s ease, transform 0.2s ease",
        cursor:          "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image area */}
      <div className="relative" style={{ backgroundColor: "#F7F7F8", padding: "16px", aspectRatio: "1/1" }}>
        {/* Badge */}
        {product.badge && badge && (
          <span
            className="absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {product.badge}
          </span>
        )}
        {!product.badge && discount && discount > 0 && (
          <span
            className="absolute top-2.5 left-2.5 z-10 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
          >
            -{discount}%
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-white"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={13} className="text-gray-400" strokeWidth={1.8} />
        </button>

        {/* Product image */}
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={product.mainImage}
            alt={product.name}
            onClick={() => router.push(`/shop/products/${product.slug}`)}
            style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[15px] font-extrabold" style={{ color: "#0F172A" }}>
            ₹{product.offerPrice.toFixed(0)}
          </span>
          {product.price && product.price > product.offerPrice && (
            <span className="text-[11px] line-through text-gray-400">
              ₹{product.price.toFixed(0)}
            </span>
          )}
          {discount && discount > 0 && (
            <span className="text-[10px] font-bold" style={{ color: "#16A34A" }}>
              {discount}% off
            </span>
          )}
        </div>

        {/* Name */}
        <p
          className="text-[12.5px] font-semibold text-gray-900 leading-snug"
          onClick={() => router.push(`/shop/products/${product.slug}`)}
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {product.name}
        </p>

        {/* Stars — empty placeholder */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={11} strokeWidth={0} fill="#E5E7EB" />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-1.5 mt-1.5">
          <button
            type="button"
            onClick={() => router.push(`/shop/products/${product.slug}`)}
            className="flex-1 py-2 rounded-full text-[11px] font-bold text-white transition-colors"
            style={{ backgroundColor: "#4C1D95" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b1572")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4C1D95")}
          >
            Buy Now
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
            style={{ border: "1.5px solid #4C1D95", color: "#4C1D95", backgroundColor: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F3FF")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <ShoppingCart size={10} strokeWidth={2.5} />
            Cart
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart } from "lucide-react";

export type ShopProductType = {
  id: string; name: string; slug: string;
  price?: number | null; offerPrice: number;
  badge?: string | null; badgeColor: string;
  mainImage: string; unit?: string | null;
};

export default function ProductCard({ product }: { product: ShopProductType | null | undefined }) {
  const router = useRouter();

  if (!product) return null;

  const discount = product.price && product.offerPrice < product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : null;

  return (
    <div
      className="flex flex-col w-full overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border:          "1px solid #EAEAEA",
        borderRadius:    "16px",
        transition:      "box-shadow 0.2s ease, transform 0.2s ease",
        cursor:          "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image area — full white */}
      <div className="relative" style={{ backgroundColor: "#FFFFFF", padding: "22px", aspectRatio: "1/1" }}>

        {/* Badge — round pill, detached from corner */}
        {product.badge ? (
          <span
            className="absolute top-3 left-3 z-10 text-[11px] font-extrabold px-3 py-1 text-white rounded-full uppercase tracking-wide"
            style={{ backgroundColor: "#DC2626" }}
          >
            {product.badge}
          </span>
        ) : discount && discount > 0 ? (
          <span
            className="absolute top-3 left-3 z-10 text-[11px] font-extrabold px-3 py-1 text-white rounded-full"
            style={{ backgroundColor: "#DC2626" }}
          >
            {discount}% OFF
          </span>
        ) : null}

        {/* Wishlist — no background, orange, slightly bigger */}
        <button
          type="button"
          className="absolute top-3 right-3 z-10 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={22} style={{ color: "#F97316" }} strokeWidth={1.8} />
        </button>

        <img
          src={product.mainImage}
          alt={product.name}
          onClick={() => router.push(`/shop/products/${product.slug}`)}
          style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map((s) => <Star key={s} size={13} strokeWidth={0} fill="#E5E7EB" />)}
        </div>

        {/* Name — bigger */}
        <p
          className="text-[16px] font-bold text-gray-900 leading-snug"
          onClick={() => router.push(`/shop/products/${product.slug}`)}
          style={{
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow:        "hidden",
            minHeight:       "42px",
          }}
        >
          {product.name}
          {product.unit && (
            <span className="text-gray-500 font-normal text-[13.5px]"> {product.unit}</span>
          )}
        </p>

        {/* Price — bigger */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[21px] font-extrabold text-gray-900">
              ₹{product.offerPrice.toFixed(0)}
            </span>
            {product.price && product.price > product.offerPrice && (
              <span className="text-[13.5px] line-through text-gray-400">
                ₹{product.price.toFixed(0)}
              </span>
            )}
          </div>
          {discount && discount > 0 && (
            <span className="text-[13px] font-bold" style={{ color: "#14532D" }}>
              {discount}% off
            </span>
          )}
        </div>

        {/* Buttons — fully round, dark green */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            type="button"
            onClick={() => router.push(`/shop/products/${product.slug}`)}
            className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white transition-colors"
            style={{ backgroundColor: "#14532D" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F3D21")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#14532D")}
          >
            Buy Now
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
            style={{ width: "44px", border: "1.5px solid #14532D", backgroundColor: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0FDF4")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
          >
            <ShoppingCart size={17} strokeWidth={2} style={{ color: "#14532D" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
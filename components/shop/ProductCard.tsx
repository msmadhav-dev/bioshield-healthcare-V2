"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { getCustomerPricing, getDoctorPricing, type Role } from "@/lib/pricing";
import { useCart } from "@/lib/useCart";

export type ShopProductType = {
  id: string; name: string; slug: string;
  customerMrp: number; customerOfferPercent?: number | null;
  doctorMrp?: number | null; doctorPtrPrice?: number | null;
  badge?: string | null; badgeColor: string; cardColor?: string;
  mainImage: string; unit?: string | null;
  productType?: string;
  categoryName?: string | null;
};

// Admin-selected per-product background — "purple" or "orange". Falls back
// to alternating by index for older rows saved before this field existed.
const IMAGE_BG = ["#EBF0FE", "#FFF1E2"];

// Custom badge only ever renders green or orange now. Older rows saved with
// "red"/"blue"/"pink" fall back to orange rather than breaking.
function badgeBg(badgeColor: string) {
  return badgeColor === "green" ? "var(--shop-success)" : "var(--shop-accent-amber)";
}

export default function ProductCard({
  product, role = "CUSTOMER", isLiked = false, onToggleLike, index = 0,
}: {
  product: ShopProductType | null | undefined;
  role?: Role;
  isLiked?: boolean;
  onToggleLike?: (productId: string) => void;
  index?: number;
}) {
  const router = useRouter();
  const { cartIds, addToCart } = useCart();
  const [heartPulse, setHeartPulse] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  if (!product) return null;

  const isDoctor = role === "DOCTOR";
  const { mrp: customerMrp, offerPrice, hasOffer } = getCustomerPricing(product);
  const { mrp: doctorMrp, ptr } = getDoctorPricing(product);

  const mrp        = isDoctor ? doctorMrp : customerMrp;
  const price       = isDoctor ? ptr : offerPrice;
  const showStrike = isDoctor || hasOffer || true; // MRP always shown struck-through somewhere
  const imageBg     = product.cardColor === "orange" ? "#FFF1E2" : product.cardColor === "purple" ? "#EBF0FE" : IMAGE_BG[index % IMAGE_BG.length];
  const inCart      = cartIds.has(product.id);

  const goToProduct = () => router.push(`/shop/products/${product.slug}`);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) return;
    addToCart(product.id);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 300);
    onToggleLike?.(product.id);
  };

  const buttonBorder = inCart
    ? "var(--shop-primary-green)"
    : btnHover
      ? "var(--shop-primary-green)"
      : "#E5E7EB";

  return (
    <div
      className="group flex flex-col w-full cursor-pointer"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #EAEAEA", borderRadius: "16px" }}
      onClick={goToProduct}
    >
      {/* Small padding gap + its own radius around the colored image panel */}
      <div className="p-2.5 md:p-3">
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: imageBg, borderRadius: "12px", aspectRatio: "4/3" }}
        >
          {/* Badge — admin custom tag only, top-left */}
          {product.badge && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex items-center gap-1">
              <span
                className="text-[10px] md:text-[12px] font-extrabold px-2.5 md:px-3 py-0.5 md:py-1 text-white rounded-full uppercase tracking-wide"
                style={{ backgroundColor: badgeBg(product.badgeColor) }}
              >
                {product.badge}
              </span>
            </div>
          )}

          {/* Like — white circle, top-right, overlapping the colored panel */}
          <button
            type="button"
            className="absolute top-2 right-2 md:top-3 md:right-3 z-10 flex items-center justify-center rounded-full bg-white"
            onClick={handleToggleLike}
            style={{
              width: "30px",
              height: "30px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              transform: heartPulse ? "scale(1.3)" : "scale(1)",
              transition: "transform 0.18s ease",
            }}
          >
            <Heart
              className="w-[15px] h-[15px] md:w-[17px] md:h-[17px]"
              style={{ color: "var(--shop-accent-amber)" }}
              strokeWidth={1.8}
              fill={isLiked ? "var(--shop-accent-amber)" : "none"}
            />
          </button>

          {/* No mix-blend-mode here — the panel is a solid color now, not
              white, and "multiply" was tinting product photos with it. */}
          <img
            src={product.mainImage}
            alt={product.name}
            className="transition-transform duration-1000 ease-out group-hover:scale-110"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-3.5 pb-3.5 md:px-5 md:pb-5 flex flex-col gap-2 md:gap-3 flex-1">

        {/* Name + category caption */}
        <div>
          <p
            className="text-[16px] md:text-[20px] font-bold text-gray-900 leading-snug transition-colors duration-700 ease-out group-hover:text-[var(--shop-primary-green)]"
            style={{
              display:         "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow:        "hidden",
            }}
          >
            {product.name}
          </p>
          {product.categoryName && (
            <p className="text-[13px] md:text-[15px] text-gray-500 mt-0.5">{product.categoryName}</p>
          )}
        </div>

        {/* Price (left) + unit box (right) — role-aware pricing */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <span className="text-[19px] md:text-[24px] font-extrabold text-gray-900">
              ₹{price.toFixed(0)}
            </span>
            {showStrike && (
              <span className="text-[12.5px] md:text-[15px] line-through" style={{ color: "var(--shop-error)" }}>
                ₹{mrp.toFixed(0)}
              </span>
            )}
            {isDoctor && <span className="text-[11px] font-semibold text-gray-400">PTR</span>}
          </div>

          {product.unit && (
            <span
              className="flex-shrink-0 text-[11.5px] md:text-[13px] font-semibold text-gray-600 rounded-md px-2 py-0.5 md:px-2.5 md:py-1"
              style={{ border: "1px solid var(--shop-border)" }}
            >
              {product.unit}
            </span>
          )}
        </div>

        {/* Add to Cart — outlined grey by default, smoothly turns primary green
            (fill + border) on hover. Once added, stays a green confirmation —
            no remove-from-here toggle. No lift, just the color transition. */}
        <button
          type="button"
          onClick={handleAddToCart}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-full text-[13.5px] md:text-[15px] font-bold mt-auto"
          style={{
            backgroundColor: inCart ? "var(--shop-primary-green)" : btnHover ? "var(--shop-primary-green)" : "#F3F4F6",
            border: `1.5px solid ${buttonBorder}`,
            color: inCart || btnHover ? "#FFFFFF" : "#111827",
            transition:
              "background-color 700ms cubic-bezier(0.22,1,0.36,1), " +
              "border-color 700ms cubic-bezier(0.22,1,0.36,1), " +
              "color 700ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {inCart ? (
            <>
              <Check className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" strokeWidth={2} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
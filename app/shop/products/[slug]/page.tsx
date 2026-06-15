"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, Star, ChevronRight, Loader2, Stethoscope } from "lucide-react";
import Link from "next/link";
import ProductCard, { type ShopProductType } from "@/components/shop/ProductCard";

type Product = ShopProductType & {
  images: string[];
  doctorOffer?: string | null;
  productDetails?: string | null;
  manufacturerDetails?: string | null;
  categoryId?: string | null;
};

export default function ProductDetailPage() {
  const { slug }   = useParams<{ slug: string }>();
  const router     = useRouter();
  const trackedRef = useRef(false);

  const [product,       setProduct]       = useState<Product | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImage,   setActiveImage]   = useState(0);
  const [recentProducts,setRecentProducts]= useState<ShopProductType[]>([]);
  const [similarProducts,setSimilarProducts]=useState<ShopProductType[]>([]);
  const [addedToCart,   setAddedToCart]   = useState(false);

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/shop-products?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Track recently viewed + fetch similar/recent
  useEffect(() => {
    if (!product || trackedRef.current) return;
    trackedRef.current = true;

    // Store in localStorage
    try {
      const key   = "bs_recently_viewed";
      const stored: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [slug, ...stored.filter((s) => s !== slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(updated));

      // Fetch recently viewed (excluding current)
      const recentSlugs = updated.filter((s) => s !== slug).slice(0, 4);
      if (recentSlugs.length > 0) {
        Promise.all(recentSlugs.map((s) =>
          fetch(`/api/shop-products?slug=${s}`).then((r) => r.json()).then((d) => d.product)
        )).then((prods) => setRecentProducts(prods.filter(Boolean)));
      }
    } catch {}

    // Fetch similar (all products, random selection)
    fetch("/api/shop-products")
      .then((r) => r.json())
      .then((d) => {
        const others = (d.products || []).filter((p: ShopProductType) => p.slug !== slug);
        const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 6);
        setSimilarProducts(shuffled);
      })
      .catch(() => {});
  }, [product, slug]);

  if (loading) {
    return (
      <main className="pt-[148px] md:pt-[68px] min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F7F7" }}>
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-[148px] md:pt-[68px] min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg">Product not found.</p>
          <button type="button" onClick={() => router.push("/shop/products")} className="mt-4 text-brand-purple-deep underline text-[14px]">
            Browse all products
          </button>
        </div>
      </main>
    );
  }

  const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);
  const discount  = product.price && product.offerPrice < product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : null;

  return (
    <main className="pt-[148px] md:pt-[68px] min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-6">
          <Link href="/shop" className="hover:text-brand-purple-deep transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href="/shop/products" className="hover:text-brand-purple-deep transition-colors">Products</Link>
          <ChevronRight size={12} />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* ── Main product section ── */}
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">

            {/* Left — Image gallery */}
            <div>
              {/* Main image */}
              <div
                className="w-full rounded-xl mb-3 flex items-center justify-center"
                style={{ aspectRatio: "1/1", backgroundColor: "#F7F7F8", padding: "20px" }}
              >
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                />
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                      style={{
                        width:  "64px",
                        height: "64px",
                        border: i === activeImage ? "2px solid #4C1D95" : "1.5px solid #E5E7EB",
                        backgroundColor: "#F7F7F8",
                        padding: "4px",
                      }}
                    >
                      <img src={img} alt={`thumb-${i}`}
                        style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Product info */}
            <div className="flex flex-col">
              {/* Badge */}
              {product.badge && (
                <span
                  className="self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3"
                  style={{
                    backgroundColor: product.badgeColor === "blue" ? "#DBEAFE" : product.badgeColor === "pink" ? "#FCE7F3" : "#FEE2E2",
                    color:           product.badgeColor === "blue" ? "#2563EB" : product.badgeColor === "pink" ? "#DB2777" : "#DC2626",
                  }}
                >
                  {product.badge}
                </span>
              )}

              {/* Name */}
              <h1 className="text-[22px] md:text-[26px] font-extrabold text-gray-900 leading-tight mb-3"
                style={{ letterSpacing: "-0.02em" }}>
                {product.name}
              </h1>

              {/* Stars placeholder */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} strokeWidth={0} fill="#E5E7EB" />
                ))}
                <span className="text-[12px] text-gray-400 ml-1">No reviews yet</span>
              </div>

              {/* Pricing */}
              <div
                className="rounded-xl p-4 mb-5"
                style={{ backgroundColor: "#F8F7FF", border: "1px solid #EDE9FE" }}
              >
                {product.price && product.price > product.offerPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] text-gray-400">M.R.P:</span>
                    <span className="text-[14px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                    {discount && (
                      <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-extrabold" style={{ color: "#4C1D95" }}>
                    ₹{product.offerPrice.toFixed(2)}
                  </span>
                  {product.price && product.price > product.offerPrice && (
                    <span className="text-[13px] text-green-600 font-semibold">
                      You save ₹{(product.price - product.offerPrice).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-all"
                  style={{ border: "2px solid #4C1D95", color: "#4C1D95", backgroundColor: addedToCart ? "#F5F3FF" : "transparent" }}
                >
                  <ShoppingCart size={16} strokeWidth={2} />
                  {addedToCart ? "Added!" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 rounded-full text-[14px] font-bold text-white transition-colors"
                  style={{ backgroundColor: "#4C1D95" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b1572")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4C1D95")}
                >
                  Buy Now
                </button>
              </div>

              {/* Doctor offer box */}
              {product.doctorOffer && (
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#DCFCE7" }}
                    >
                      <Stethoscope size={18} style={{ color: "#166534" }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-green-800 mb-0.5 uppercase tracking-wide">
                        Exclusive Doctor&apos;s Offer
                      </p>
                      <p className="text-[13px] text-green-700 leading-relaxed">
                        {product.doctorOffer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Product Details ── */}
        {product.productDetails && (
          <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Product Details</h2>
            <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.productDetails}
            </div>
          </div>
        )}

        {/* ── Manufacturer Details ── */}
        {product.manufacturerDetails && (
          <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Manufacturer Details</h2>
            <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
              {product.manufacturerDetails}
            </div>
          </div>
        )}

        {/* ── Recently Viewed ── */}
        {recentProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Recently Viewed</h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
            <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Similar Products</h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews Placeholder ── */}
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm mb-5">
          <h2 className="text-[17px] font-extrabold text-gray-900 mb-4">Customer Reviews</h2>
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl"
            style={{ backgroundColor: "#F9FAFB", border: "1.5px dashed #E5E7EB" }}
          >
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} strokeWidth={0} fill="#E5E7EB" />
              ))}
            </div>
            <p className="text-gray-500 font-medium text-[14px]">No reviews yet</p>
            <p className="text-gray-400 text-[12px] mt-1">Be the first to review this product</p>
          </div>
        </div>

      </div>
    </main>
  );
}
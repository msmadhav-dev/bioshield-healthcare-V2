"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingCart, Star, ChevronRight, Loader2,
  Share2, Check, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import ProductCard, { type ShopProductType } from "@/components/shop/ProductCard";

type DetailSection = { heading: string; content: string };
type TabKey = "details" | "benefits" | "manufacturer" | "description";

type Product = ShopProductType & {
  images:                 string[];
  doctorOffer?:           string | null;
  productDetails?:        string | null;
  manufacturerDetails?:   string | null;
  benefits?:              string | null;
  productDescription?:    string | null;
  offers?:                string[];
  frequentlyBoughtIds?:   string[];
  categoryId?:            string | null;
  unit?:                  string | null;
  availableUnits?:        string[];
  stock?:                 number | null;
};

export default function ProductDetailPage() {
  const { slug }   = useParams<{ slug: string }>();
  const router     = useRouter();
  const trackedRef = useRef(false);
  const timerRef   = useRef<NodeJS.Timeout | null>(null);

  const [product,           setProduct]           = useState<Product | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [activeImage,       setActiveImage]       = useState(0);
  const [selectedUnit,      setSelectedUnit]      = useState<string | null>(null);
  const [unitOpen,          setUnitOpen]          = useState(false);
  const [recentProducts,    setRecentProducts]    = useState<ShopProductType[]>([]);
  const [similarProducts,   setSimilarProducts]   = useState<ShopProductType[]>([]);
  const [frequentlyBought,  setFrequentlyBought]  = useState<ShopProductType[]>([]);
  const [addedToCart,       setAddedToCart]       = useState(false);
  const [copied,            setCopied]            = useState(false);
  const [referralCopied,    setReferralCopied]    = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(400);
  const [activeTab,         setActiveTab]         = useState<TabKey>("details");

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/shop-products?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product);
        if (d.product?.availableUnits?.length > 0) {
          setSelectedUnit(d.product.availableUnits[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Fetch site settings
  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => setFreeDeliveryThreshold(d.settings?.freeDeliveryThreshold ?? 400))
      .catch(() => {});
  }, []);

  // Auto slideshow every 5 seconds
  const allImages = product
    ? [product.mainImage, ...(product.images || [])].filter(Boolean)
    : [];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (allImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % allImages.length);
    }, 5000);
  }, [allImages.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleThumbnailClick = (i: number) => {
    setActiveImage(i);
    resetTimer();
  };

  // Track recently viewed + fetch similar + frequently bought
  useEffect(() => {
    if (!product || trackedRef.current) return;
    trackedRef.current = true;

    try {
      const key     = "bs_recently_viewed";
      const stored: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [slug, ...stored.filter((s) => s !== slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(updated));

      const recentSlugs = updated.filter((s) => s !== slug).slice(0, 6);
      if (recentSlugs.length > 0) {
        Promise.all(
          recentSlugs.map((s) =>
            fetch(`/api/shop-products?slug=${s}`).then((r) => r.json()).then((d) => d.product)
          )
        ).then((prods) => setRecentProducts(prods.filter(Boolean)));
      }
    } catch {}

    fetch("/api/shop-products")
      .then((r) => r.json())
      .then((d) => {
        const others = (d.products || []).filter((p: ShopProductType) => p.slug !== slug);
        setSimilarProducts(others.sort(() => Math.random() - 0.5).slice(0, 8));
      })
      .catch(() => {});

    if (product.frequentlyBoughtIds && product.frequentlyBoughtIds.length > 0) {
      fetch(`/api/shop-products?ids=${product.frequentlyBoughtIds.join(",")}`)
        .then((r) => r.json())
        .then((d) => setFrequentlyBought(d.products || []))
        .catch(() => {});
    }
  }, [product, slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name || "", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  // TODO: once the referral system exists, swap `url` below for the user's
  // actual referral link instead of the plain page link.
  const handleReferralShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join me on Bioshield Healthcare", url });
      } else {
        await navigator.clipboard.writeText(url);
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2500);
      }
    } catch {}
  };

  if (loading) {
    return (
      <main className="pt-[148px] md:pt-[68px] min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-[148px] md:pt-[68px] min-h-screen bg-white px-4 md:px-14">
        <div className="py-20 text-center">
          <p className="text-gray-500 text-lg">Product not found.</p>
          <button type="button" onClick={() => router.push("/shop/products")}
            className="mt-4 underline text-[14px]" style={{ color: "#14532D" }}>
            Browse all products
          </button>
        </div>
      </main>
    );
  }

  const discount = product.price && product.offerPrice < product.price
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : null;

  let detailSections: DetailSection[] = [];
  if (product.productDetails) {
    try {
      const parsed = JSON.parse(product.productDetails);
      if (Array.isArray(parsed)) detailSections = parsed;
    } catch {}
  }

  const tabs: { key: TabKey; label: string }[] = [];
  if (detailSections.length > 0)      tabs.push({ key: "details",      label: "Details" });
  if (product.benefits)               tabs.push({ key: "benefits",     label: "Benefits" });
  if (product.manufacturerDetails)    tabs.push({ key: "manufacturer", label: "Manufacturer Details" });
  if (product.productDescription)     tabs.push({ key: "description",  label: "Description" });
  const currentTab = tabs.some((t) => t.key === activeTab) ? activeTab : tabs[0]?.key;

  return (
    <main className="pt-[148px] md:pt-[68px] min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="px-4 md:px-14 pt-6 md:pt-8 pb-4 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
        <ChevronRight size={11} />
        <Link href="/shop/products" className="hover:text-gray-900 transition-colors">Products</Link>
        <ChevronRight size={11} />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* ── Main product section ── */}
      <div className="px-4 md:px-14 pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">

          {/* Left — images, reduced size, white bg */}
          <div>
            <div
              className="w-full rounded-2xl flex items-center justify-center mb-4 overflow-hidden mx-auto"
              style={{ aspectRatio: "1/1", backgroundColor: "#FFFFFF", border: "1px solid #F0F0F0", padding: "32px", maxWidth: "460px" }}
            >
              <img
                key={activeImage}
                src={allImages[activeImage] || product.mainImage}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 mx-auto" style={{ scrollbarWidth: "none", maxWidth: "460px" }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleThumbnailClick(i)}
                    className="flex-shrink-0 rounded-xl overflow-hidden transition-all"
                    style={{
                      width:           "72px",
                      height:          "72px",
                      border:          i === activeImage ? "2px solid #14532D" : "1.5px solid #E5E7EB",
                      backgroundColor: "#FFFFFF",
                      padding:         "6px",
                    }}
                  >
                    <img src={img} alt={`thumb-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col">

            {product.badge && (
              <span className="self-start text-[10px] font-extrabold px-2.5 py-0.5 rounded mb-3 text-white uppercase"
                style={{ backgroundColor: "#DC2626" }}>
                {product.badge}
              </span>
            )}

            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-[22px] md:text-[26px] font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {product.name}
                {product.unit && (
                  <span className="text-[15px] text-gray-500 font-normal ml-1">({product.unit})</span>
                )}
              </h1>
              <button
                type="button"
                onClick={handleShare}
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ border: "1px solid #E5E7EB", backgroundColor: copied ? "#F0FDF4" : "#FFFFFF" }}
                title={copied ? "Link copied!" : "Share product"}
              >
                {copied ? <Check size={15} style={{ color: "#14532D" }} /> : <Share2 size={15} className="text-gray-500" />}
              </button>
            </div>

            <div className="flex items-center gap-0.5 mb-5">
              {[1,2,3,4,5].map((s) => <Star key={s} size={14} strokeWidth={0} fill="#E5E7EB" />)}
              <span className="text-[12px] text-gray-400 ml-1.5">No reviews yet</span>
            </div>

            {/* Price */}
            <div className="mb-5 pb-5" style={{ borderBottom: "1px solid #F0F0F0" }}>
              {product.price && product.price > product.offerPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] text-gray-400">M.R.P:</span>
                  <span className="text-[13px] text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                  {discount && (
                    <span className="text-[11px] font-extrabold text-white px-2 py-0.5 rounded" style={{ backgroundColor: "#DC2626" }}>
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[32px] font-extrabold text-gray-900">₹{product.offerPrice.toFixed(2)}</span>
                {product.price && product.price > product.offerPrice && (
                  <span className="text-[13px] font-semibold" style={{ color: "#14532D" }}>
                    You save ₹{(product.price - product.offerPrice).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">Inclusive of all taxes</p>
            </div>

            {/* Buttons — smaller */}
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                onClick={() => { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                style={{
                  border:          "2px solid #14532D",
                  color:           addedToCart ? "#FFFFFF" : "#14532D",
                  backgroundColor: addedToCart ? "#14532D" : "transparent",
                }}
              >
                <ShoppingCart size={15} strokeWidth={2} />
                {addedToCart ? "Added!" : "Add to Cart"}
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-colors"
                style={{ backgroundColor: "#14532D" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F3D21")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#14532D")}
              >
                Buy Now
              </button>
            </div>

            {/* Select Size dropdown */}
            {product.availableUnits && product.availableUnits.length > 0 && selectedUnit && (
              <div className="mb-5 mt-3">
                <p className="text-[12px] font-bold text-gray-700 mb-1.5">Select Size</p>
                <div className="relative" style={{ maxWidth: "220px" }}>
                  <button
                    type="button"
                    onClick={() => setUnitOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                    style={{ border: "1.5px solid #14532D", color: "#14532D", backgroundColor: "#FFFFFF" }}
                  >
                    {selectedUnit}
                    <ChevronDown size={14} style={{ transform: unitOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>

                  {unitOpen && (
                    <div
                      className="absolute z-30 mt-1 w-full rounded-lg overflow-hidden"
                      style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", boxShadow: "0 10px 28px rgba(0,0,0,0.1)" }}
                    >
                      {product.availableUnits.map((u) => {
                        const isSelected = selectedUnit === u;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => { setSelectedUnit(u); setUnitOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors"
                            style={{
                              backgroundColor: isSelected ? "#14532D" : "#FFFFFF",
                              color:           isSelected ? "#FFFFFF" : "#374151",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#14532D"; e.currentTarget.style.color = "#FFFFFF"; }}
                            onMouseLeave={(e) => {
                              if (!isSelected) { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.color = "#374151"; }
                            }}
                          >
                            {u}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock */}
            {product.stock !== null && product.stock !== undefined && (
              <p className="text-[12px] font-semibold mb-4"
                style={{ color: product.stock > 10 ? "#14532D" : product.stock > 0 ? "#D97706" : "#DC2626" }}>
                {product.stock > 10 ? "✓ In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
              </p>
            )}

            {/* ── Info rows: doctor offer, referral, delivery, offers ── */}
            <div className="flex flex-col gap-4 pt-2" style={{ borderTop: "1px solid #F0F0F0" }}>

              {product.doctorOffer && (
                <div className="flex items-start gap-3 pt-4">
                  <img src="/icons/doctor.svg" alt="" style={{ width: 28, height: 28, objectFit: "contain", marginTop: "1px" }} className="flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Exclusive Doctor&apos;s Offer</p>
                    <p className="text-[12.5px] text-gray-600 mt-0.5">{product.doctorOffer}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3" style={{ paddingTop: product.doctorOffer ? 0 : "16px" }}>
                <img src="/icons/chatting-talk.svg" alt="" style={{ width: 28, height: 28, objectFit: "contain", marginTop: "1px" }} className="flex-shrink-0" />
                <div className="flex-1 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={handleReferralShare}
                      className="text-left"
                      title={referralCopied ? "Link copied!" : "Share your referral link"}
                    >
                      <p
                        className="text-[13px] font-bold underline"
                        style={{ color: "#14532D", textDecorationColor: "#14532D", textUnderlineOffset: "2px" }}
                      >
                        Refer a friend &amp; get 10% cashback
                      </p>
                    </button>
                    <p className="text-[12px] text-gray-500 mt-0.5">Share with friends and earn rewards on their first order</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReferralShare}
                    className="flex-shrink-0 rounded-full flex items-center justify-center transition-all"
                    style={{ width: 38, height: 38, border: "1px solid #E5E7EB", backgroundColor: referralCopied ? "#F0FDF4" : "#FFFFFF" }}
                    title={referralCopied ? "Link copied!" : "Share your referral link"}
                  >
                    {referralCopied ? <Check size={17} style={{ color: "#14532D" }} /> : <Share2 size={17} className="text-gray-500" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <img src="/icons/coupon.svg" alt="" style={{ width: 28, height: 28, objectFit: "contain", marginTop: "1px" }} className="flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-gray-900">Enter referral code &amp; get 10% immediate cashback</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <img src="/icons/delivery-truck.svg" alt="" style={{ width: 28, height: 28, objectFit: "contain", marginTop: "1px" }} className="flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-gray-900">
                    Free delivery on orders above ₹{freeDeliveryThreshold}
                  </p>
                </div>
              </div>

              {product.offers && product.offers.length > 0 && (
                <div className="flex items-start gap-3">
                  <img src="/icons/offer.svg" alt="" style={{ width: 28, height: 28, objectFit: "contain", marginTop: "1px" }} className="flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 mb-1">Available Offers</p>
                    <ul className="space-y-1">
                      {product.offers.map((o, i) => (
                        <li key={i} className="text-[12.5px] text-gray-600">• {o}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Details / Benefits / Manufacturer / Description — tabbed, white bg ── */}
        {tabs.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">
              About {product.name}
            </h2>

            <div className="bg-white">
              {/* Tab row */}
              <div className="flex items-center gap-7 overflow-x-auto" style={{ borderBottom: "1px solid #E5E7EB", scrollbarWidth: "none" }}>
                {tabs.map((t) => {
                  const isActive = currentTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className="flex-shrink-0 pb-3 text-[13.5px] font-bold whitespace-nowrap transition-colors"
                      style={{
                        color:        isActive ? "#14532D" : "#9CA3AF",
                        borderBottom: isActive ? "2px solid #14532D" : "2px solid transparent",
                        marginBottom: "-1px",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="pt-6">
                {currentTab === "details" && (
                  <div className="space-y-6">
                    {detailSections.map((section, i) => (
                      <div key={i}>
                        <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{section.heading}</h3>
                        <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        {i < detailSections.length - 1 && <div className="mt-5" style={{ borderBottom: "1px solid #F5F5F5" }} />}
                      </div>
                    ))}
                  </div>
                )}

                {currentTab === "benefits" && (
                  <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{product.benefits}</p>
                )}

                {currentTab === "manufacturer" && (
                  <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{product.manufacturerDetails}</p>
                )}

                {currentTab === "description" && (
                  <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{product.productDescription}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Product Images — contained, not full-bleed ── */}
        {allImages.length > 0 && (
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Product Images</h2>
            <div className="flex flex-col items-center gap-5">
              {allImages.map((img, i) => (
                <div
                  key={i}
                  className="w-full rounded-xl overflow-hidden mx-auto"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #F0F0F0", maxWidth: "560px" }}
                >
                  <img src={img} alt={`${product.name}-${i}`} style={{ width: "100%", display: "block", objectFit: "contain" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Customer Reviews ── */}
        <div className="mt-8 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
          <h2 className="text-[20px] font-extrabold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="flex flex-col items-center py-10">
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map((s) => <Star key={s} size={28} strokeWidth={0} fill="#E5E7EB" />)}
            </div>
            <p className="text-gray-500 font-medium text-[14px]">No reviews yet</p>
            <p className="text-gray-400 text-[12px] mt-1">Be the first to review this product</p>
          </div>
        </div>

        {/* ── Frequently Bought Together ── */}
        {frequentlyBought.length > 0 && (
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Frequently Bought Together</h2>
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
              {frequentlyBought.map((p) => (
                <div key={p.id} style={{ width: "230px", minWidth: "230px", flexShrink: 0 }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Similar Products</h2>
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
              {similarProducts.map((p) => (
                <div key={p.id} style={{ width: "230px", minWidth: "230px", flexShrink: 0 }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recently Viewed ── */}
        {recentProducts.length > 0 && (
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid #EFEFEF" }}>
            <h2 className="text-[20px] font-extrabold text-gray-900 mb-5">Recently Viewed</h2>
            <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
              {recentProducts.map((p) => (
                <div key={p.id} style={{ width: "230px", minWidth: "230px", flexShrink: 0 }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
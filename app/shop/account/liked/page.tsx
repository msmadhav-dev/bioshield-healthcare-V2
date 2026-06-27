"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Loader2 } from "lucide-react";
import ProductCard, { type ShopProductType } from "@/components/shop/ProductCard";
import { useUserRole } from "@/lib/useUserRole";
import { useLikedProducts } from "@/lib/useLikedProducts";

const GREEN = "#14532D";

export default function LikedProductsPage() {
  const [products, setProducts] = useState<ShopProductType[]>([]);
  const [loading,  setLoading]  = useState(true);
  const role = useUserRole();
  const { likedIds, toggleLike } = useLikedProducts();

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/liked")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d.products) ? d.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Removing a product from "liked" should drop it out of this grid right
  // away, instead of waiting for a refetch.
  const handleToggleLike = (id: string) => {
    toggleLike(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="px-4 md:px-12 py-5 md:py-8">
      <h1 className="text-[19px] md:text-[26px] font-extrabold mb-4 md:mb-6" style={{ color: GREEN }}>
        Liked Products
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-[15px] font-bold text-gray-900 mb-1">No liked products yet</p>
          <p className="text-[13px] text-gray-500">Tap the heart on any product to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id} product={p} role={role}
              isLiked={likedIds.has(p.id)}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

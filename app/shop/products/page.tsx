"use client";

import { useEffect, useState } from "react";
import ProductCard, { type ShopProductType } from "@/components/shop/ProductCard";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopProductType[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/shop-products")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="pt-[148px] md:pt-[68px] min-h-screen" style={{ backgroundColor: "#F7F7F7" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">All Products</h1>
        <p className="text-sm text-gray-500 mb-8">Browse our complete range of healthcare products</p>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 font-medium text-[15px]">No products yet</p>
            <p className="text-gray-400 text-sm mt-1">Products will appear here once added by admin.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
            {products.map((product) => (
              <div key={product.id} style={{ width: "100%" }}>
                <div style={{ width: "100%" }}>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
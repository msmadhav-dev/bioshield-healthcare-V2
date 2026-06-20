"use client";

import { useEffect, useState } from "react";
import ProductCard, { type ShopProductType } from "@/components/shop/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopProductType[]>([]);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    fetch("/api/shop-products")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <main className="pt-[148px] md:pt-[68px] min-h-screen bg-white">
      <div className="px-4 md:px-14 py-8">
        <h1 className="text-[22px] font-extrabold text-gray-900 mb-1">All Products</h1>
        <p className="text-[13px] text-gray-500 mb-7">Browse our complete range of healthcare products</p>

        {loaded && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 font-medium">No products yet</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
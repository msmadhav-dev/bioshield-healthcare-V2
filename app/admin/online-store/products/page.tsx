"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Loader2, RefreshCw } from "lucide-react";

type Product = {
  id: string; name: string; slug: string;
  customerMrp: number; customerOfferPercent?: number | null;
  badge?: string | null; badgeColor: string; cardColor?: string;
  mainImage: string; sectionId?: string | null;
  unit?: string | null;
  categoryName?: string | null;
  createdAt: string;
};

export default function ViewShopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,    setError]    = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/shop-products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch { setError("Failed to load."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/shop-products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) setProducts((p) => p.filter((pr) => pr.id !== id));
      else setError(data.error || "Delete failed.");
    } catch { setError("Delete failed."); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Shop Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchProducts} disabled={loading}
            className="p-2 rounded-lg text-gray-500" style={{ backgroundColor: "#F3F4F6" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/online-store/products/add"
            className="px-4 py-2 text-[13px] font-semibold text-white rounded-lg"
            style={{ backgroundColor: "#4C1D95" }}>
            + Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-5 text-[13px] text-red-500"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#E5E7EB" }}>
          <p className="text-gray-400 font-medium">No products yet</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;+ Add Product&quot; to add your first product.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const imageBg = product.cardColor === "orange" ? "#FFF1E2" : "#EBF0FE";

            return (
              <div key={product.id} className="bg-white overflow-hidden" style={{ border: "1px solid #E5E7EB", borderRadius: "16px" }}>
                <div className="p-2">
                  <div className="relative p-3" style={{ backgroundColor: imageBg, borderRadius: "12px", aspectRatio: "4/3" }}>
                    <img src={product.mainImage} alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    {product.badge && (
                      <span
                        className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase"
                        style={{ backgroundColor: product.badgeColor === "green" ? "var(--shop-success)" : "var(--shop-accent-amber)" }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{product.name}</p>
                  {product.categoryName && (
                    <p className="text-[10.5px] text-gray-500 truncate">{product.categoryName}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[11px] text-gray-500">
                      {product.customerOfferPercent
                        ? <>₹{(product.customerMrp * (1 - product.customerOfferPercent / 100)).toFixed(0)} <span className="line-through ml-1" style={{ color: "var(--shop-error)" }}>₹{product.customerMrp}</span></>
                        : <>₹{product.customerMrp}</>}
                    </p>
                    {product.unit && (
                      <span className="flex-shrink-0 text-[9px] font-semibold text-gray-600 rounded px-1.5 py-0.5" style={{ border: "1px solid var(--shop-border)" }}>
                        {product.unit}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Link href={`/admin/online-store/products/edit/${product.id}`}
                      className="text-[10px] font-semibold text-brand-purple-deep">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                      className="p-1 text-red-400 hover:text-red-600">
                      {deleting === product.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
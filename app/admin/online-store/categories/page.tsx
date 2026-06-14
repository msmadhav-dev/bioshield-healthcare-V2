"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Loader2, RefreshCw } from "lucide-react";

type Category = { id: string; name: string; image?: string | null; createdAt: string };

export default function ViewCategories() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,   setError]   = useState("");

  const fetchCats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      setCats(data.categories || []);
    } catch { setError("Failed to load."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) setCats((p) => p.filter((c) => c.id !== id));
      else setError(data.error || "Delete failed.");
    } catch { setError("Delete failed."); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "Loading..." : `${cats.length} categor${cats.length !== 1 ? "ies" : "y"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchCats} disabled={loading} className="p-2 rounded-lg text-gray-500" style={{ backgroundColor: "#F3F4F6" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/online-store/categories/add" className="px-4 py-2 text-[13px] font-semibold text-white rounded-lg" style={{ backgroundColor: "#4C1D95" }}>
            + Add Category
          </Link>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-5 text-[13px] text-red-500" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
          {error}
        </div>
      )}

      {loading && <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}

      {!loading && cats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed" style={{ borderColor: "#E5E7EB" }}>
          <p className="text-gray-400 font-medium">No categories yet</p>
          <p className="text-gray-400 text-sm mt-1">Add &quot;General&quot; as your first category.</p>
        </div>
      )}

      {!loading && cats.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {cats.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center group">
              <div className="w-full aspect-square bg-white flex items-center justify-center rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain p-3" />
                ) : (
                  <span className="text-3xl text-gray-300">{cat.name[0]}</span>
                )}
              </div>
              <p className="text-[12px] font-medium text-gray-800 text-center mt-1.5">{cat.name}</p>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deleting === cat.id}
                className="mt-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deleting === cat.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import type { Product } from "@prisma/client";

export default function ViewProductCards() {
  const [cards,    setCards]   = useState<Product[]>([]);
  const [loading,  setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,    setError]   = useState("");

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/productcards");
      const data = await res.json();
      setCards(data.productcards || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load product cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product card? This cannot be undone.")) return;
    setDeleting(id);
    setError("");

    try {
      const res  = await fetch(`/api/productcards/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Delete failed. Please try again.");
        return;
      }

      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Product Cards</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading
              ? "Loading..."
              : `${cards.length} card${cards.length !== 1 ? "s" : ""} in total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-800"
            style={{ backgroundColor: "#F3F4F6" }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/productcards/add"
            className="px-4 py-2 text-[13px] font-semibold text-white rounded-lg"
            style={{ backgroundColor: "#4C1D95" }}
          >
            + Add Card
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5 text-[13px]"
          style={{
            backgroundColor: "#FEF2F2",
            color:            "#EF4444",
            border:           "1px solid #FECACA",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty */}
      {!loading && cards.length === 0 && !error && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed"
          style={{ borderColor: "#E5E7EB" }}
        >
          <p className="text-gray-400 font-medium text-[15px]">
            No product cards yet
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Click &quot;+ Add Card&quot; to upload your first product card.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white overflow-hidden"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <div className="relative aspect-[3/4] bg-gray-50">
                <Image
                  src={card.frontImage}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              </div>

              <div className="p-3">
                <p className="text-[13px] font-semibold text-gray-800 truncate">
                  {card.name}
                </p>
                <p className="text-[11px] text-gray-400 capitalize mt-0.5">
                  {card.category}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: card.backImage ? "#F0FDF4" : "#F9FAFB",
                      color:           card.backImage ? "#166534" : "#9CA3AF",
                    }}
                  >
                    {card.backImage ? "Front + Back" : "Front only"}
                  </span>

                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deleting === card.id}
                    className="p-1.5 rounded transition-colors cursor-pointer"
                    style={{ color: "#EF4444" }}
                    title="Delete card"
                  >
                    {deleting === card.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
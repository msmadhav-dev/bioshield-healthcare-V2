"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, RefreshCw } from "lucide-react";

type Ad = {
  id: string; slot: number; badge?: string | null; topCaption?: string | null;
  heading: string; subText?: string | null; productName: string;
  image?: string | null; imageSize: number;
};

// Fixed colors per slot
const SLOT_CONFIG: Record<number, { bg: string; textLight: boolean; label: string; hasImage: boolean }> = {
  1: { bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 60%, #A7F3D0 100%)", textLight: false, label: "Main Banner (Large Left)",  hasImage: true  },
  2: { bg: "linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)",               textLight: false, label: "Top Right Small",           hasImage: true  },
  3: { bg: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",               textLight: true,  label: "Top Right Dark",            hasImage: false },
  4: { bg: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",               textLight: false, label: "Bottom Right Banner",       hasImage: true  },
};

function SlotPreview({
  slot, ad, onEdit, onClear, clearing,
}: {
  slot:     number;
  ad?:      Ad;
  onEdit:   () => void;
  onClear:  (id: string) => void;
  clearing: string | null;
}) {
  const cfg = SLOT_CONFIG[slot];
  const isMain = slot === 1;

  return (
    <div
      className="relative overflow-hidden w-full h-full group"
      style={{
        background: cfg.bg,
        borderRadius:    "12px",
        minHeight:       isMain ? "280px" : "130px",
      }}
    >
      {ad ? (
        <>
          {/* Badge */}
          {ad.badge && (
            <span className="absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded text-white z-10"
              style={{ backgroundColor: "#EF4444" }}>
              {ad.badge}
            </span>
          )}

          {/* Text */}
          <div className="relative z-10 p-4 pt-8 flex flex-col justify-end h-full"
            style={{ paddingRight: ad.image ? `${(ad.imageSize / 100) * 42 + 8}%` : undefined }}>
            {ad.topCaption && (
              <p className="text-[10px] mb-1" style={{ color: cfg.textLight ? "rgba(255,255,255,0.65)" : "#6B7280" }}>
                {ad.topCaption}
              </p>
            )}
            <p className="font-bold leading-tight mb-2"
              style={{
                color:    cfg.textLight ? "#FFFFFF" : "#111827",
                fontSize: isMain ? "16px" : slot === 3 ? "18px" : "13px",
              }}>
              {ad.heading}
            </p>
            {ad.subText && (
              <p className="text-[9px] mb-2" style={{ color: cfg.textLight ? "rgba(255,255,255,0.6)" : "#6B7280" }}>
                {ad.subText}
              </p>
            )}
            {slot !== 3 && (
              <span className="inline-block px-3 py-1 rounded-full text-white text-[10px] font-semibold w-fit"
                style={{ backgroundColor: slot === 4 ? "#4C1D95" : "#166534" }}>
                Shop Now →
              </span>
            )}
          </div>

          {/* Product image preview */}
          {ad.image && cfg.hasImage && (
            <div className="absolute bottom-0 right-0 z-20"
              style={{ width: `${(ad.imageSize / 100) * 42}%`, height: "100%" }}>
              <img src={ad.image} alt={ad.productName}
                style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply", objectPosition: "bottom right" }} />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 z-30 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
              style={{ backgroundColor: "#4C1D95" }}>
              <Pencil size={13} /> Edit
            </button>
            <button onClick={() => onClear(ad.id)}
              disabled={clearing === ad.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
              style={{ backgroundColor: "#EF4444" }}>
              {clearing === ad.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Clear
            </button>
          </div>
        </>
      ) : (
        /* Empty slot */
        <div
          onClick={onEdit}
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-2 group-hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
            <Plus size={20} style={{ color: cfg.textLight ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)" }} />
          </div>
          <p className="text-[11px] font-semibold text-center px-4"
            style={{ color: cfg.textLight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)" }}>
            {cfg.label}
          </p>
          <p className="text-[10px]" style={{ color: cfg.textLight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }}>
            Click to add
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdvertisementsPage() {
  const router   = useRouter();
  const [ads,    setAds]     = useState<Ad[]>([]);
  const [loading,setLoading] = useState(true);
  const [clearing,setClearing] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/advertisements");
      const data = await res.json();
      setAds(data.advertisements || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const clearSlot = async (id: string) => {
    if (!confirm("Clear this banner slot?")) return;
    setClearing(id);
    await fetch(`/api/advertisements/${id}`, { method: "DELETE" });
    setAds((p) => p.filter((a) => a.id !== id));
    setClearing(null);
  };

  const getSlot = (n: number) => ads.find((a) => a.slot === n);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Advertisements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Click any slot to add or edit the banner content.</p>
        </div>
        <button onClick={fetchAds} disabled={loading}
          className="p-2 rounded-lg text-gray-500" style={{ backgroundColor: "#F3F4F6" }}>
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "60% 1fr", gridTemplateRows: "auto" }}>

          {/* Slot 1 — big left, spans 2 rows */}
          <div style={{ gridRow: "1 / 3", minHeight: "380px" }}>
            <SlotPreview slot={1} ad={getSlot(1)}
              onEdit={() => router.push("/admin/online-store/advertisements/slot/1")}
              onClear={clearSlot} clearing={clearing} />
          </div>

          {/* Top right — slots 2 + 3 side by side */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", height: "180px" }}>
            <SlotPreview slot={2} ad={getSlot(2)}
              onEdit={() => router.push("/admin/online-store/advertisements/slot/2")}
              onClear={clearSlot} clearing={clearing} />
            <SlotPreview slot={3} ad={getSlot(3)}
              onEdit={() => router.push("/admin/online-store/advertisements/slot/3")}
              onClear={clearSlot} clearing={clearing} />
          </div>

          {/* Bottom right — slot 4 full width */}
          <div style={{ height: "180px" }}>
            <SlotPreview slot={4} ad={getSlot(4)}
              onEdit={() => router.push("/admin/online-store/advertisements/slot/4")}
              onClear={clearSlot} clearing={clearing} />
          </div>

        </div>
      )}

      {/* Slot legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-2 text-[12px] text-gray-600">
            <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: SLOT_CONFIG[n].bg, border: "1px solid #E5E7EB" }} />
            Slot {n}: {SLOT_CONFIG[n].label.split(" ")[0]} {SLOT_CONFIG[n].label.split(" ")[1]}
          </div>
        ))}
      </div>
    </div>
  );
}
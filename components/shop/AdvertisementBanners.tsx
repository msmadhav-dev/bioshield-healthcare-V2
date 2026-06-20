"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Ad = {
  id: string; slot: number; badge?: string | null; topCaption?: string | null;
  heading: string; subText?: string | null; productName: string;
  image?: string | null; imageSize: number;
};

const SLOTS: Record<number, {
  bg: string; gradient?: string; textLight: boolean;
  btnBg: string; btnText: string; hasImage: boolean; label: string;
}> = {
  1: { bg: "#D1FAE5", gradient: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 60%, #A7F3D0 100%)", textLight: false, btnBg: "#059669", btnText: "#FFFFFF", hasImage: true,  label: "Main Large Left" },
  2: { bg: "#CFFAFE", gradient: "linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)",               textLight: false, btnBg: "#0891B2", btnText: "#FFFFFF", hasImage: true,  label: "Top Right Small" },
  3: { bg: "#0F172A", gradient: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",               textLight: true,  btnBg: "rgba(255,255,255,0.15)", btnText: "#FFFFFF", hasImage: false, label: "Top Right Dark" },
  4: { bg: "#F5F0FF", gradient: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",               textLight: false, btnBg: "#7C3AED", btnText: "#FFFFFF", hasImage: true,  label: "Bottom Right" },
};

function Banner({ ad, slot, isMain = false }: { ad?: Ad; slot: number; isMain?: boolean }) {
  const router = useRouter();
  const cfg    = SLOTS[slot];

  const imgWidth = ad
    ? isMain
      ? `clamp(160px, ${(ad.imageSize / 100) * 48}%, 58%)`
      : `clamp(90px, ${(ad.imageSize / 100) * 55}%, 62%)`
    : "0";

  return (
    <motion.div
      whileHover={{ scale: 1.012, boxShadow: "0 20px 50px rgba(0,0,0,0.13)" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="relative overflow-hidden w-full h-full"
      style={{ background: cfg.gradient || cfg.bg, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", cursor: ad ? "pointer" : "default" }}
      onClick={() => ad && router.push(`/shop/products/${ad.productName}`)}
    >
      {!ad && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.05)" }} />
        </div>
      )}

      {ad && (
        <>
          <div
            className="relative z-10 flex flex-col p-5 md:p-7 h-full"
            style={{ paddingRight: cfg.hasImage && ad.image ? `calc(${imgWidth} + 12px)` : undefined }}
          >
            {ad.badge && (
              <div className="mb-3 self-start">
                <span className="text-[12px] font-extrabold px-3 py-1.5 rounded-md text-white tracking-wide" style={{ backgroundColor: "#EF4444" }}>
                  {ad.badge}
                </span>
              </div>
            )}

            {ad.topCaption && (
              <p className="mb-1.5 font-semibold" style={{ color: cfg.textLight ? "rgba(255,255,255,0.65)" : "#64748B", fontSize: slot === 3 ? "11px" : "13px" }}>
                {ad.topCaption}
              </p>
            )}

            <h3
              className="leading-tight"
              style={{
                color:            cfg.textLight ? "#FFFFFF" : "#0F172A",
                fontSize:         isMain ? "clamp(24px, 2.8vw, 36px)" : slot === 3 ? "clamp(24px, 2.4vw, 32px)" : "clamp(18px, 2vw, 24px)",
                letterSpacing:    "-0.03em",
                fontWeight:       "800",
                WebkitTextStroke: cfg.textLight ? "0" : "0.3px #0F172A",
              }}
            >
              {ad.heading}
            </h3>

            {ad.subText && (
              <p className="text-[11px] leading-relaxed mt-2 max-w-[200px]" style={{ color: cfg.textLight ? "rgba(255,255,255,0.55)" : "#94A3B8" }}>
                {ad.subText}
              </p>
            )}

            {slot !== 3 && (
              <div className="mt-4">
                <button type="button" className="px-5 py-2.5 rounded-full text-[13px] font-bold transition-all hover:opacity-90 hover:scale-105" style={{ backgroundColor: cfg.btnBg, color: cfg.btnText }}>
                  Shop Now →
                </button>
              </div>
            )}
          </div>

          {ad.image && cfg.hasImage && (
            <div className="absolute bottom-0 right-0 z-20 pointer-events-none" style={{ width: imgWidth, height: "100%" }}>
              <img src={ad.image} alt={ad.productName} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom right", mixBlendMode: "multiply", display: "block" }} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function AdvertisementBanners() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/advertisements")
      .then((r) => r.json())
      .then((d) => setAds(d.advertisements || []))
      .catch(() => {});
  }, []);

  const getSlot = (n: number) => ads.find((a) => a.slot === n);

  return (
    <section className="w-full py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.5 }}
        className="hidden md:grid gap-4 px-6"
        style={{ gridTemplateColumns: "60% 1fr", gridTemplateRows: "auto" }}
      >
        <div style={{ gridRow: "1 / 3", minHeight: "460px" }}>
          <div className="h-full"><Banner ad={getSlot(1)} slot={1} isMain /></div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", height: "215px" }}>
          <Banner ad={getSlot(2)} slot={2} />
          <Banner ad={getSlot(3)} slot={3} />
        </div>
        <div style={{ height: "215px" }}>
          <Banner ad={getSlot(4)} slot={4} />
        </div>
      </motion.div>

      <div className="md:hidden flex flex-col gap-3 px-3">
        {[1, 2, 3, 4].map((n, i) => (
          <motion.div key={n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.35, delay: i * 0.06 }} style={{ height: n === 1 ? "300px" : "170px" }}>
            <Banner ad={getSlot(n)} slot={n} isMain={n === 1} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
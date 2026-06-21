"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export type Ad = {
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

// Fetch logic pulled out so it can be reused for the mobile (interleaved) layout too.
export function useAdvertisements() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/advertisements")
      .then((r) => r.json())
      .then((d) => setAds(d.advertisements || []))
      .catch(() => {});
  }, []);

  return ads;
}

export function Banner({ ad, slot, isMain = false }: { ad?: Ad; slot: number; isMain?: boolean }) {
  const router = useRouter();
  const cfg    = SLOTS[slot];

  // Slots 2 and 4 are the tightest on height (215px desktop / 170px mobile) while also
  // carrying an image-reserved heading (more likely to wrap to 2 lines) plus a button —
  // they need noticeably tighter spacing than slot 1 (tall) or slot 3 (no button) to avoid
  // the button getting pushed past the card's bottom edge and clipped.
  const isCompact = !isMain && slot !== 3;

  const imgWidth = ad
    ? isMain
      ? `clamp(160px, ${(ad.imageSize / 100) * 48}%, 58%)`
      : `clamp(90px, ${(ad.imageSize / 100) * 55}%, 62%)`
    : "0";

  return (
    <div
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
          {/*
            Any slot with an image gets the single-line + overlap treatment: text sits
            above the image (z-20 > z-10) and only reserves space for the image on md+
            screens, so on mobile the heading gets full width and stays on one line — if
            it still reaches the image area, the image is transparent/multiply-blended so
            the overlap reads fine. Slot 3 has no image, so it keeps normal wrapping —
            there's nothing for its text to overlap if it ran out of room.
          */}
          <div
            className={`relative flex flex-col h-full ${cfg.hasImage ? "z-20" : "z-10"} ${isMain ? "p-5 md:p-7" : isCompact ? "p-4 md:p-5" : "p-5 md:p-7"} ${cfg.hasImage ? "md:[padding-right:var(--img-w)]" : ""}`}
            style={
              cfg.hasImage && ad.image
                ? ({ ["--img-w" as any]: `calc(${imgWidth} + 12px)` })
                : undefined
            }
          >
            {ad.badge && (
              <div className={`self-start ${isCompact ? "mb-1.5" : "mb-3"}`}>
                <span className="text-[12px] font-extrabold px-3 py-1.5 rounded-md text-white tracking-wide" style={{ backgroundColor: "#EF4444" }}>
                  {ad.badge}
                </span>
              </div>
            )}

            {ad.topCaption && (
              <p className={`font-semibold ${isCompact ? "mb-1" : "mb-1.5"}`} style={{ color: cfg.textLight ? "rgba(255,255,255,0.65)" : "#64748B", fontSize: slot === 3 ? "11px" : "13px" }}>
                {ad.topCaption}
              </p>
            )}

            <h3
              className="leading-tight"
              style={{
                color:            cfg.textLight ? "#FFFFFF" : "#0F172A",
                fontSize:         isMain ? "clamp(26px, 3vw, 40px)" : slot === 3 ? "clamp(22px, 2.2vw, 26px)" : "clamp(17px, 1.8vw, 21px)",
                letterSpacing:    "-0.03em",
                fontWeight:       "900",
                WebkitTextStroke: cfg.textLight ? "0" : "0.3px #0F172A",
                whiteSpace:       cfg.hasImage ? "nowrap" : "normal",
              }}
            >
              {ad.heading}
            </h3>

            {ad.subText && !isCompact && (
              <p
                className="text-[12px] mt-2"
                style={{
                  color:        cfg.textLight ? "rgba(255,255,255,0.6)" : "#94A3B8",
                  whiteSpace:   "nowrap",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  maxWidth:     cfg.hasImage ? "90%" : "100%",
                }}
              >
                {ad.subText}
              </p>
            )}

            {slot !== 3 && (
              <div className={isCompact ? "mt-1.5" : "mt-4"}>
                <button
                  type="button"
                  className={`rounded-full font-bold transition-all hover:opacity-90 hover:scale-105 ${isCompact ? "px-4 py-1.5 text-[12px]" : "px-5 py-2.5 text-[13px]"}`}
                  style={{ backgroundColor: cfg.btnBg, color: cfg.btnText }}
                >
                  Shop Now →
                </button>
              </div>
            )}
          </div>

          {/* Main banner's image is confined to the bottom portion on mobile so it never sits over the heading; other slots keep their original full-height image (text just overlaps on top now, which is fine). */}
          {ad.image && cfg.hasImage && (
            <div className={`absolute bottom-0 right-0 z-10 pointer-events-none ${isMain ? "h-[58%] md:h-full" : "h-full"}`} style={{ width: imgWidth }}>
              <img src={ad.image} alt={ad.productName} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom right", mixBlendMode: "multiply", display: "block" }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdvertisementBanners() {
  const ads = useAdvertisements();
  const getSlot = (n: number) => ads.find((a) => a.slot === n);

  return (
    <section className="w-full pt-8 md:pt-14 pb-4" style={{ backgroundColor: "#FFFFFF" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.5 }}
        className="hidden md:grid gap-4 md:px-14"
        style={{ gridTemplateColumns: "60% 1fr", gridTemplateRows: "auto" }}
      >
        <div style={{ gridRow: "1 / 3", minHeight: "528px" }}>
          <div className="h-full"><Banner ad={getSlot(1)} slot={1} isMain /></div>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr", height: "256px" }}>
          <Banner ad={getSlot(2)} slot={2} />
          <Banner ad={getSlot(3)} slot={3} />
        </div>
        <div style={{ height: "256px" }}>
          <Banner ad={getSlot(4)} slot={4} />
        </div>
      </motion.div>
    </section>
  );
}
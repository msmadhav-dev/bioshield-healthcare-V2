"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Heart, MapPin, ArrowRight } from "lucide-react";

export default function ShopHero() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F5F0FF 0%, #EDF9F4 60%, #F0F9FF 100%)",
        minHeight: "clamp(480px, 85vh, 720px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-8 items-center py-16 md:py-20">

          {/* ── LEFT — Text content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5 order-2 lg:order-1"
          >
            <span
              className="text-[12px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "#166534" }}
            >
              Genuine 100% Authentic Products
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.1] text-gray-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              Healthcare Products
              <br />
              <span style={{ color: "#4C1D95" }}>For Your Family</span>
            </h1>

            <p className="text-gray-500 text-[15px] leading-relaxed max-w-md">
              Discover Bioshield&apos;s trusted range of pharmaceutical products —
              quality-assured, doctor-recommended medicines delivered to your door.
            </p>

            <div className="flex items-center gap-4 mt-2">
              
                <a href="#products" className="group inline-flex items-center gap-2 px-7 py-[14px] rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:gap-3" style={{ backgroundColor: "#4C1D95" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3b1572")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4C1D95")}>
                Shop Now
                <ArrowRight size={15} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>

          {/* ── RIGHT — Delivery image + decoratives ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative flex items-end justify-center order-1 lg:order-2"
            style={{ height: "clamp(380px, 55vw, 580px)" }}
          >
            {/* ── Decorative SVG rings + dots ── */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 560 560"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer solid ring */}
              <circle cx="280" cy="260" r="220" stroke="#6B21A8" strokeWidth="1.5" strokeOpacity="0.12" fill="none"/>
              {/* Middle ring */}
              <circle cx="280" cy="260" r="170" stroke="#22C55E" strokeWidth="1.5" strokeOpacity="0.14" fill="none"/>
              {/* Inner ring */}
              <circle cx="280" cy="260" r="120" stroke="#4C1D95" strokeWidth="1" strokeOpacity="0.1" fill="none"/>
              {/* Dashed outer ring */}
              <circle cx="280" cy="260" r="245" stroke="#4C1D95" strokeWidth="1" strokeOpacity="0.08" fill="none" strokeDasharray="8 12"/>

              {/* Dotted arc — top right */}
              <path d="M 420 80 Q 500 180 480 320" stroke="#22C55E" strokeWidth="1.5" strokeOpacity="0.25" fill="none" strokeDasharray="4 8"/>
              {/* Dotted arc — bottom left */}
              <path d="M 140 420 Q 80 320 120 200" stroke="#6B21A8" strokeWidth="1.5" strokeOpacity="0.2" fill="none" strokeDasharray="4 8"/>

              {/* Small dot accents */}
              <circle cx="480" cy="180" r="5" fill="#4C1D95" fillOpacity="0.2"/>
              <circle cx="495" cy="200" r="3" fill="#4C1D95" fillOpacity="0.13"/>
              <circle cx="90"  cy="350" r="4" fill="#22C55E" fillOpacity="0.22"/>
              <circle cx="75"  cy="370" r="2.5" fill="#22C55E" fillOpacity="0.14"/>
              <circle cx="440" cy="400" r="3.5" fill="#6B21A8" fillOpacity="0.15"/>

              {/* Cross accent top */}
              <line x1="100" y1="110" x2="116" y2="110" stroke="#4C1D95" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round"/>
              <line x1="108" y1="102" x2="108" y2="118" stroke="#4C1D95" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round"/>
            </svg>

            {/* ── Floating Heart icon — top left of image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
              className="absolute z-20 flex items-center justify-center rounded-full shadow-lg"
              style={{
                width: "52px",
                height: "52px",
                backgroundColor: "#FFFFFF",
                top: "22%",
                left: "8%",
                boxShadow: "0 8px 28px rgba(107,33,168,0.18)",
                border: "2px solid #F0ECF9",
              }}
            >
              <Heart size={22} fill="#4C1D95" color="#4C1D95" strokeWidth={0} />
            </motion.div>

            {/* ── Floating Location pin — right side ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.75, ease: "backOut" }}
              className="absolute z-20 flex items-center justify-center rounded-full shadow-lg"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#FFFFFF",
                top: "38%",
                right: "4%",
                boxShadow: "0 6px 22px rgba(34,197,94,0.2)",
                border: "2px solid #F0FDF4",
              }}
            >
              <MapPin size={18} fill="#22C55E" color="#22C55E" strokeWidth={0} />
            </motion.div>

            {/* ── Delivery image ── */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-end justify-center"
              style={{ height: "95%", width: "80%" }}
            >
              <Image
                src="/Bisohield_Deliery_.png"
                alt="Bioshield Delivery"
                fill
                priority
                className="object-contain object-bottom"
                style={{ mixBlendMode: "multiply" }}
                sizes="(max-width: 1024px) 90vw, 50vw"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ── Category content ─────────────────────────────────────────
const categories = [
  {
    tab:     "General",
    heading: "General Care",
    caption: "Bioshield's general care range delivers evidence-based formulations trusted by physicians across multiple medical disciplines. From everyday wellness to targeted therapeutic care, our medicines are designed for reliable outcomes, consistent quality, and patient safety in every prescription.",
    link:    "/products",
  },
  {
    tab:     "Dental",
    heading: "Dental Care",
    caption: "Our advanced dental formulations promote oral hygiene, prevent bacterial infections, and support long-term dental wellness. Developed with cutting-edge research, Bioshield's dental range gives practitioners the confidence to prescribe solutions that deliver visible, lasting results for every patient.",
    link:    "/products",
  },
  {
    tab:     "Ortho",
    heading: "Orthopedic Care",
    caption: "Bioshield's orthopedic range focuses on bone strength, joint mobility, and effective pain management. Formulated with precision to support musculoskeletal health, our products empower patients to regain comfort, improve quality of life, and maintain an active, pain-free lifestyle every day.",
    link:    "/products",
  },
];

// ── Text animation variants ──────────────────────────────────
const textWrap = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  exit:    { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.28 } },
};

export default function ProductCategoriesSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [current, setCurrent] = useState(0);
  const autoRef               = useRef<NodeJS.Timeout | null>(null);
  const total                 = categories.length;

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, 4000);
  }, [total]);
  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);
  const resetAuto = useCallback(() => { stopAuto(); startAuto(); }, [startAuto, stopAuto]);

  useEffect(() => { startAuto(); return () => stopAuto(); }, [startAuto, stopAuto]);

  return (
    <section
      ref={ref}
      className="w-full px-6 md:px-12 overflow-hidden"
      style={{ backgroundColor: "#FAFAFA", minHeight: "640px", paddingTop: "80px", paddingBottom: "0" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-0 items-center">

          {/* ═══════ LEFT — Sliding text ═══════ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:pr-16"
          >
            {/* Category tabs */}
            <div className="flex items-center gap-2 mb-10">
              {categories.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); resetAuto(); }}
                  className="relative px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] rounded-full transition-all duration-200 cursor-pointer border-none"
                  style={{
                    backgroundColor: i === current ? "#4C1D95" : "transparent",
                    color:            i === current ? "#ffffff" : "#9CA3AF",
                    outline:          i === current ? "none" : "1px solid #E5E7EB",
                  }}
                >
                  {c.tab}
                </button>
              ))}
            </div>

            {/* Animated text block */}
            <div className="min-h-[260px] md:min-h-[220px] flex flex-col justify-start">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  variants={textWrap}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Heading */}
                  <motion.h2
                    variants={fadeUp}
                    className="text-4xl md:text-5xl lg:text-[54px] font-extrabold leading-[1.1] mb-6 text-gray-900"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {categories[current].heading.split(" ")[0]}{" "}
                    <span className="text-brand-purple-deep">
                      {categories[current].heading.split(" ").slice(1).join(" ")}
                    </span>
                  </motion.h2>

                  {/* Caption */}
                  <motion.p
                    variants={fadeUp}
                    className="text-[15px] md:text-base text-gray-600 leading-[1.8] mb-8 max-w-lg"
                  >
                    {categories[current].caption}
                  </motion.p>

                  {/* Underlined explore link */}
                  <motion.div variants={fadeUp}>
                    <Link
                      href={categories[current].link}
                      className="inline-flex items-center gap-2 text-[14px] font-bold text-brand-purple-deep border-b-2 border-brand-purple-deep pb-[2px] hover:text-brand-purple hover:border-brand-purple transition-colors duration-200 uppercase tracking-[0.08em]"
                    >
                      Explore Products
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mt-10">
              {categories.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => { setCurrent(i); resetAuto(); }}
                  animate={
                    i === current
                      ? { width: 28, opacity: 1,   backgroundColor: "#4C1D95" }
                      : { width: 8,  opacity: 0.35, backgroundColor: "#9CA3AF" }
                  }
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full border-none p-0 cursor-pointer"
                  aria-label={`Go to ${categories[i].tab}`}
                />
              ))}
            </div>
          </motion.div>

          {/* ═══════ RIGHT — Doctor image + decorative lines ═══════ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative -mt-16 lg:mt-0"
            style={{ height: "clamp(360px, 55vw, 580px)" }}
          >
            {/* Decorative SVG lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 560 580"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 480 80 C 560 180, 560 400, 480 500 C 420 555, 300 580, 180 550 C 80 520, 10 430, 10 300 C 10 170, 80 70, 200 35 C 310 2, 420 -5, 480 80 Z"
                stroke="#6B21A8"
                strokeWidth="1"
                strokeOpacity="0.08"
                fill="none"
              />
              <path
                d="M 430 130 C 500 210, 500 370, 430 450 C 375 505, 270 528, 165 500 C 75 472, 18 392, 20 285 C 22 178, 85 98, 195 68 C 295 42, 375 62, 430 130 Z"
                stroke="#4C1D95"
                strokeWidth="1"
                strokeOpacity="0.1"
                fill="none"
              />
              <ellipse cx="290" cy="290" rx="250" ry="260" stroke="#22C55E" strokeWidth="0.75" strokeOpacity="0.08" fill="none" strokeDasharray="6 10"/>
              <line x1="460" y1="80"  x2="480" y2="80"  stroke="#6B21A8" strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round"/>
              <line x1="470" y1="70"  x2="470" y2="90"  stroke="#6B21A8" strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round"/>
              <line x1="80"  y1="460" x2="100" y2="460" stroke="#22C55E" strokeWidth="2" strokeOpacity="0.2"  strokeLinecap="round"/>
              <line x1="90"  y1="450" x2="90"  y2="470" stroke="#22C55E" strokeWidth="2" strokeOpacity="0.2"  strokeLinecap="round"/>
              <circle cx="500" cy="250" r="3.5" fill="#4C1D95" fillOpacity="0.12"/>
              <circle cx="520" cy="270" r="2"   fill="#4C1D95" fillOpacity="0.1"/>
              <circle cx="60"  cy="200" r="3"   fill="#22C55E" fillOpacity="0.15"/>
            </svg>

            {/* Doctor image — anchored to bottom, fills full height */}
            <div className="absolute bottom-0 right-0 z-10 h-full flex items-end justify-end">
              <Image
                src="/Doctor-image.png"
                alt="Bioshield Healthcare Doctor"
                width={960}
                height={1080}
                className="object-contain object-bottom"
                style={{
                  height: "100%",
                  width: "auto",
                  maxWidth: "none",
                  mixBlendMode: "multiply",
                }}
                priority
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
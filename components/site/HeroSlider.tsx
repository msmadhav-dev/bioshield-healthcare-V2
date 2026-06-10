"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Slides with category + caption ────────────────────────────────────────
const slides = [
  {
    img: "/general 1.jpg",
    alt: "General healthcare products",
    category: "General Care",
    heading: "Everyday Healthcare Essentials",
    caption:
      "Evidence-based formulations supporting reliable therapeutic care across general medical needs.",
  },
  {
    img: "/dental.jpg",
    alt: "Dental care products",
    category: "Dental Care",
    heading: "Advanced Oral Health Solutions",
    caption:
      "Scientifically developed dental formulations for stronger teeth, healthier gums, and lasting wellness.",
  },
  {
    img: "/ortho 1.jpg",
    alt: "Orthopedic products",
    category: "Orthopedic Care",
    heading: "Bone & Joint Wellness",
    caption:
      "Innovative orthopedic care designed to support mobility, strength, and effective pain management.",
  },
];

// ── Text animation variants ──────────────────────────────────────────────
const textContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  exit:    { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const itemUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const pill = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit:    { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const autoRef               = useRef<NodeJS.Timeout | null>(null);
  const startXRef             = useRef(0);
  const isDraggingRef         = useRef(false);
  const total                 = slides.length;

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 6000);
  }, [total]);

  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  const resetAuto = useCallback(() => {
    stopAuto();
    startAuto();
  }, [startAuto, stopAuto]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
    resetAuto();
  }, [total, resetAuto]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
    resetAuto();
  }, [total, resetAuto]);

  const goTo = (i: number) => {
    setCurrent(i);
    resetAuto();
  };

  const onDragStart = (x: number) => {
    isDraggingRef.current = true;
    startXRef.current = x;
  };
  const onDragEnd = (x: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = x - startXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev();
      else next();
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      style={{ height: "calc(100vh - 70px)" }}
    >
      {/* ── All slides stacked — opacity-only crossfade ── */}
      {slides.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ opacity: i === current ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Image
            src={slide.img}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-contain object-center scale-90 md:scale-95"
            draggable={false}
          />
        </motion.div>
      ))}

      {/* ── Bottom gradient overlay — only behind text area ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] md:h-[45%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.15) 70%, transparent 100%)",
        }}
      />

      {/* ── Drag/swipe layer ── */}
      <div
        className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
        onMouseDown={(e)  => onDragStart(e.clientX)}
        onMouseUp={(e)    => onDragEnd(e.clientX)}
        onMouseLeave={()  => { isDraggingRef.current = false; }}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchEnd={(e)   => onDragEnd(e.changedTouches[0].clientX)}
      />

      {/* ── Text overlay ── */}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none px-6 md:px-16 lg:px-24 pb-24 md:pb-28">
        <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              variants={textContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Category pill */}
              <motion.div variants={pill} className="mb-4 flex justify-center md:justify-start">
                <span
                  className="inline-block px-4 py-[5px] rounded-full text-[10.5px] font-bold tracking-[0.18em] uppercase text-white border border-white/40"
                  style={{
                    backgroundColor: "rgba(107, 33, 168, 0.85)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {slides[current].category}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={itemUp}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-4"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
              >
                {slides[current].heading}
              </motion.h1>

              {/* Caption */}
              <motion.p
                variants={itemUp}
                className="text-[13px] sm:text-sm md:text-base text-white/85 leading-relaxed max-w-xl mx-auto md:mx-0"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
              >
                {slides[current].caption}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Prev arrow ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-40 text-white/85 hover:text-white transition-all duration-200 hover:scale-110"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <ChevronLeft size={44} strokeWidth={2.2} className="md:w-12 md:h-12" />
      </button>

      {/* ── Next arrow ── */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-40 text-white/85 hover:text-white transition-all duration-200 hover:scale-110"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <ChevronRight size={44} strokeWidth={2.2} className="md:w-12 md:h-12" />
      </button>

      {/* ── Dots ── */}
      <div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2"
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
      >
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            animate={
              i === current
                ? { width: 32, opacity: 1 }
                : { width: 8, opacity: 0.55 }
            }
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full bg-white cursor-pointer border-none p-0"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      
    </section>
  );
}
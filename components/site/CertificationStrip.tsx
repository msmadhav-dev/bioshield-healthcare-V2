"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const certs = [
  { img: "/WHO logo.png",     alt: "World Health Organization"        },
  { img: "/innovative.png",   alt: "Innovative pharmaceutical product"},
  { img: "/glp logo.png",     alt: "Good Laboratory Practice"         },
  { img: "/GMP LOGO.jpg",     alt: "Good Manufacturing Practice"      },
];

export default function CertificationStrip() {
  const [current, setCurrent] = useState(0);
  const autoRef               = useRef<NodeJS.Timeout | null>(null);
  const startXRef             = useRef(0);
  const isDraggingRef         = useRef(false);
  const total                 = certs.length;

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, 3000);
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

  const prev = () => {
    setCurrent((c) => (c - 1 + total) % total);
    resetAuto();
  };
  const next = () => {
    setCurrent((c) => (c + 1) % total);
    resetAuto();
  };

  // ── Drag / swipe handlers ──
  const onDragStart = (x: number) => {
    isDraggingRef.current = true;
    startXRef.current = x;
  };
  const onDragEnd = (x: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = x - startXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) prev();
      else next();
    }
  };

  return (
    <section className="w-full bg-white py-8 md:py-12 border-b border-gray-100">

      {/* ── Desktop ── */}
      <div className="hidden md:flex max-w-6xl mx-auto px-8 items-center justify-between gap-8">
        {certs.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.06 }}
            className="flex-1 flex items-center justify-center cursor-pointer"
          >
            <div className="relative w-full h-[90px]">
              <Image
                src={c.img}
                alt={c.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 25vw, 280px"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Mobile ── */}
      <div className="md:hidden relative">
        {/* Side peek shadows */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
          <div className="w-[15%] h-full flex items-center justify-center opacity-30">
            <div className="relative w-full h-[60px]">
              <Image
                src={certs[(current - 1 + total) % total].img}
                alt=""
                fill
                className="object-contain"
                sizes="60px"
              />
            </div>
          </div>
          <div className="w-[15%] h-full flex items-center justify-center opacity-30">
            <div className="relative w-full h-[60px]">
              <Image
                src={certs[(current + 1) % total].img}
                alt=""
                fill
                className="object-contain"
                sizes="60px"
              />
            </div>
          </div>
        </div>

        {/* White fades on edges */}
        <div
          className="absolute inset-y-0 left-0 w-[22%] z-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[22%] z-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(255,255,255,0.95) 30%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Main slide */}
        <div className="relative h-[110px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60, scale: 0.85 }}
              animate={{ opacity: 1, x: 0,  scale: 1    }}
              exit={{    opacity: 0, x: -60, scale: 0.85 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center px-16"
            >
              <div className="relative w-full h-full max-w-[200px]">
                <Image
                  src={certs[current].img}
                  alt={certs[current].alt}
                  fill
                  className="object-contain"
                  sizes="200px"
                  draggable={false}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Drag/swipe layer ── */}
        <div
          className="absolute inset-x-12 top-0 bottom-0 z-25 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onMouseDown={(e)  => onDragStart(e.clientX)}
          onMouseUp={(e)    => onDragEnd(e.clientX)}
          onMouseLeave={()  => { isDraggingRef.current = false; }}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchEnd={(e)   => onDragEnd(e.changedTouches[0].clientX)}
        />

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous certification"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1 text-gray-400 hover:text-gray-700 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronLeft size={26} strokeWidth={2.2} />
        </button>
        <button
          onClick={next}
          aria-label="Next certification"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1 text-gray-400 hover:text-gray-700 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronRight size={26} strokeWidth={2.2} />
        </button>

        {/* Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {certs.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setCurrent(i); resetAuto(); }}
              animate={
                i === current
                  ? { width: 22, opacity: 1,   backgroundColor: "#166534" }
                  : { width: 6,  opacity: 0.4, backgroundColor: "#9CA3AF" }
              }
              transition={{ duration: 0.25 }}
              className="h-1.5 rounded-full border-none p-0 cursor-pointer"
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
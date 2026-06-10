"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ── About carousel slides ────────────────────────────────────
const aboutSlides = [
  {
    img: "/doctor-child.jpg",
    heading: "Caring for Every Generation",
    caption: "From pediatric care to family wellness, we deliver trusted medicines that nurture health at every stage of life.",
  },
  {
    img: "/lab.jpg",
    heading: "Innovation in Every Formula",
    caption: "Research-driven formulations developed by leading scientists to set new standards in pharmaceutical excellence.",
  },
  {
    img: "/prescription.jpg",
    heading: "Trusted by Medical Experts",
    caption: "Recommended by thousands of doctors across India for proven efficacy, safety, and consistent therapeutic results.",
  },
  {
    img: "/test.jpg",
    heading: "Quality You Can See",
    caption: "Every product undergoes rigorous laboratory testing to ensure purity, potency, and uncompromising quality standards.",
  },
];

// ── Feature highlights — using SVG files from /public ────────
const features = [
  {
    icon: "/medicines.svg",
    title: "GMP & WHO Certified",
    desc: "Every product is manufactured under strict international quality standards, ensuring safety and reliability.",
  },
  {
    icon: "/test-tubes.svg",
    title: "Research-Driven",
    desc: "Our formulations are backed by clinical research and developed through scientific excellence.",
  },
];

// ── Animation variants ───────────────────────────────────────
const slideContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  exit:    { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};
const slideText = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

export default function AboutSection() {
  const ref           = useRef(null);
  const inView        = useInView(ref, { once: true, margin: "-100px" });

  const [current, setCurrent]   = useState(0);
  const autoRef                 = useRef<NodeJS.Timeout | null>(null);
  const startXRef               = useRef(0);
  const isDraggingRef           = useRef(false);
  const total                   = aboutSlides.length;

  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % total);
    }, 5000);
  }, [total]);
  const stopAuto  = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);
  const resetAuto = useCallback(() => { stopAuto(); startAuto(); }, [startAuto, stopAuto]);

  useEffect(() => { startAuto(); return () => stopAuto(); }, [startAuto, stopAuto]);

  const onDragStart = (x: number) => {
    isDraggingRef.current = true;
    startXRef.current = x;
  };
  const onDragEnd = (x: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = x - startXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrent((c) => (c - 1 + total) % total);
      } else {
        setCurrent((c) => (c + 1) % total);
      }
      resetAuto();
    }
  };

  return (
    <section
      ref={ref}
      id="about"
      className="w-full py-16 md:py-24 px-6 md:px-12 bg-white"
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ═══════ LEFT — Image Carousel (no shadow) ═══════ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden"
            onMouseDown={(e)  => onDragStart(e.clientX)}
            onMouseUp={(e)    => onDragEnd(e.clientX)}
            onMouseLeave={()  => { isDraggingRef.current = false; }}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchEnd={(e)   => onDragEnd(e.changedTouches[0].clientX)}
            style={{ cursor: "grab" }}
          >
            {aboutSlides.map((slide, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === current ? 1 : 0 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
              >
                <Image
                  src={slide.img}
                  alt={slide.heading}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  draggable={false}
                  priority={i === 0}
                />
              </motion.div>
            ))}

            <div
              className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.1) 80%, transparent 100%)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 z-20 px-6 md:px-8 pb-16 md:pb-20 pointer-events-none">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  variants={slideContainer}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h3
                    variants={slideText}
                    className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-3"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                  >
                    {aboutSlides[current].heading}
                  </motion.h3>
                  <motion.p
                    variants={slideText}
                    className="text-[13px] md:text-sm text-white/85 leading-relaxed max-w-md"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
                  >
                    {aboutSlides[current].caption}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {aboutSlides.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => { setCurrent(i); resetAuto(); }}
                  animate={
                    i === current
                      ? { width: 28, opacity: 1 }
                      : { width: 7,  opacity: 0.55 }
                  }
                  transition={{ duration: 0.3 }}
                  className="h-[6px] rounded-full bg-white cursor-pointer border-none p-0"
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>

          {/* ═══════ RIGHT — Content ═══════ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <span className="block text-[11px] font-bold tracking-[0.22em] uppercase text-brand-green-dark mb-3">
  About Bioshield
</span>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold leading-[1.15] mb-5 text-gray-900">
              Healthcare Solutions for a{" "}
              <span className="text-brand-purple-deep">Healthier Tomorrow</span>
            </h2>

            <p className="text-[15px] md:text-base text-gray-600 leading-relaxed mb-8">
              Bioshield Healthcare is committed to delivering high-quality,
              research-driven pharmaceutical products that improve patient
              outcomes across multiple medical disciplines. With trusted
              formulations and uncompromising quality standards, we partner
              with doctors and patients to build a healthier future.
            </p>

            <div className="grid sm:grid-cols-2 gap-7 mb-9">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                >
                  <div className="mb-4">
                    <Image
                      src={f.icon}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1.5">
                    {f.title}
                  </h4>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <Link
              href="/vision"
              className="inline-flex items-center gap-2 px-7 py-[14px] rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] text-white bg-brand-green-dark hover:bg-brand-green-deep transition-all duration-200 hover:gap-3 group"
            >
              Our Vision
              <ArrowRight size={16} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
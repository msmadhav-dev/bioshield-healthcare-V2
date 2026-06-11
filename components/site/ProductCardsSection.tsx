"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Product } from "@prisma/client";

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center"
        style={{ width: "min(480px, 90vw)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors z-10"
        >
          <X size={26} strokeWidth={2} />
        </button>

        {/* Flip card */}
        <div
          className="w-full overflow-hidden"
          style={{
            perspective: "1200px",
            cursor:      product.backImage ? "pointer" : "default",
            aspectRatio: "3/4",
          }}
          onClick={() => product.backImage && setFlipped((f) => !f)}
        >
          <motion.div
            className="relative w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backfaceVisibility:       "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <img
                src={product.frontImage}
                alt={product.name}
                draggable={false}
                style={{
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "cover",
                  display:    "block",
                  userSelect: "none",
                }}
              />
            </div>

            {/* Back */}
            {product.backImage && (
              <div
                className="absolute inset-0 overflow-hidden bg-white"
                style={{
                  backfaceVisibility:       "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <img
                  src={product.backImage}
                  alt={`${product.name} back`}
                  draggable={false}
                  style={{
                    width:      "100%",
                    height:     "100%",
                    objectFit:  "contain",
                    display:    "block",
                    userSelect: "none",
                  }}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Hint */}
        <p className="text-white/60 text-[12px] mt-4 text-center">
          {product.backImage
            ? flipped
              ? "tap to flip back · tap outside to close"
              : "tap to flip · tap outside to close"
            : "tap outside to close"}
        </p>

        {/* View All */}
        <Link
          href="/products"
          className="mt-4 flex items-center gap-2 px-7 py-3 rounded-full text-[13px] font-semibold text-white transition-all"
          style={{ backgroundColor: "#4C1D95" }}
          onClick={(e) => e.stopPropagation()}
        >
          View All Products
          <ChevronRight size={15} strokeWidth={2.5} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function ProductCardsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);

  const startXRef    = useRef(0);
  const startYRef    = useRef(0);
  const didDragRef   = useRef(false);

  useEffect(() => {
    fetch("/api/productcards")
      .then((r) => r.json())
      .then((d) => { setProducts(d.productcards || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const total = products.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const handlePointerDown = (x: number, y: number) => {
    startXRef.current  = x;
    startYRef.current  = y;
    didDragRef.current = false;
  };

  const handlePointerMove = (x: number, y: number) => {
    const dx = Math.abs(x - startXRef.current);
    const dy = Math.abs(y - startYRef.current);
    if (dx > 8 || dy > 8) didDragRef.current = true;
  };

  const handlePointerUp = (x: number, centerProduct: Product) => {
    const diff = x - startXRef.current;
    if (didDragRef.current) {
      if (Math.abs(diff) > 50) {
        if (diff > 0) prev(); else next();
      }
    } else {
      setSelected(centerProduct);
    }
    didDragRef.current = false;
  };

  const getIndices = () => {
    if (total === 1) return [{ idx: 0, pos: "center" }];
    if (total === 2) return [
      { idx: current,               pos: "center" },
      { idx: (current + 1) % total, pos: "right"  },
    ];
    return [
      { idx: (current - 1 + total) % total, pos: "left"   },
      { idx: current,                        pos: "center" },
      { idx: (current + 1) % total,          pos: "right"  },
    ];
  };

  const centerProduct = products[current] ?? null;

  return (
    <>
      <AnimatePresence>
        {selected && (
          <ProductModal product={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <section className="w-full py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span
              className="text-[11px] font-bold tracking-[0.22em] uppercase"
              style={{ color: "#166534" }}
            >
              Our Products
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              Some Of Our{" "}
              <span style={{ color: "#4C1D95" }}>Products</span>
            </h2>
            <p className="text-gray-500 text-[14px] max-w-md mx-auto mb-2">
              Discover our comprehensive range of pharmaceutical solutions
              designed for diverse healthcare needs.
            </p>
            <p className="text-gray-400 text-[11px] tracking-widest uppercase">
              drag to explore →
            </p>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-16">
              <div
                className="w-9 h-9 border-2 rounded-full animate-spin"
                style={{ borderColor: "#4C1D95", borderTopColor: "transparent" }}
              />
            </div>
          )}

          {!loading && products.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">
              No products added yet.
            </p>
          )}

          {/* Carousel */}
          {!loading && products.length > 0 && centerProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative select-none"
            >
              {/* Cards track */}
              <div
                className="flex items-center justify-center gap-4 md:gap-10 px-12 md:px-24 cursor-grab active:cursor-grabbing"
                onMouseDown={(e)  => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e)  => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={(e)    => handlePointerUp(e.clientX, centerProduct)}
                onMouseLeave={()  => { didDragRef.current = false; }}
                onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={(e)  => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchEnd={(e)   => handlePointerUp(e.changedTouches[0].clientX, centerProduct)}
              >
                {getIndices().map(({ idx, pos }) => {
                  const product  = products[idx];
                  const isCenter = pos === "center";

                  return (
                    <div
                      key={`${product.id}-${pos}`}
                      className="flex-shrink-0 flex flex-col items-center"
                      style={{
                        width:      isCenter ? "clamp(240px, 28vw, 380px)" : "clamp(150px, 18vw, 240px)",
                        opacity:    isCenter ? 1 : 0.4,
                        transform:  isCenter ? "scale(1)" : "scale(0.85)",
                        transition: "all 0.4s ease",
                        zIndex:     isCenter ? 10 : 1,
                      }}
                    >
                      <div
                        style={{
                          height:   isCenter ? "clamp(340px, 38vw, 540px)" : "clamp(210px, 25vw, 340px)",
                          width:    "100%",
                          overflow: "hidden",
                          border:   "1px solid #E5E7EB",
                          position: "relative",
                        }}
                      >
                        <Image
                          src={product.frontImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 240px, 380px"
                          draggable={false}
                          priority={isCenter}
                        />
                      </div>

                      {isCenter && (
                        <div className="text-center mt-3 pointer-events-none">
                          <p className="text-[13px] font-semibold text-gray-700">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            click to view
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-0 top-[45%] -translate-y-1/2 z-30 p-2 transition-colors"
                    style={{ color: "#9CA3AF" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#4C1D95")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                  >
                    <ChevronLeft size={36} strokeWidth={2} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-0 top-[45%] -translate-y-1/2 z-30 p-2 transition-colors"
                    style={{ color: "#9CA3AF" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#4C1D95")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
                  >
                    <ChevronRight size={36} strokeWidth={2} />
                  </button>
                </>
              )}

              {/* Dots */}
              {total > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  {products.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setCurrent(i)}
                      animate={
                        i === current
                          ? { width: 28, opacity: 1,    backgroundColor: "#4C1D95" }
                          : { width: 8,  opacity: 0.35, backgroundColor: "#9CA3AF" }
                      }
                      transition={{ duration: 0.3 }}
                      className="h-2 rounded-full border-none p-0 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </section>
    </>
  );
}
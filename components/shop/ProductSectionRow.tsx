"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import ProductCard, { type ShopProductType } from "./ProductCard";

const CARD_WIDTH = 260;

function HorizontalProductRow({ products }: { products: ShopProductType[] | undefined | null }) {
  const list = Array.isArray(products) ? products.filter(Boolean) : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, list.length]);

  if (list.length === 0) return null;

  const scrollByAmount = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * (CARD_WIDTH * 3), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { isDown: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.isDown) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragState.current.startX;

    if (Math.abs(dx) > 4 && !dragState.current.moved) {
      dragState.current.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    }

    if (dragState.current.moved) {
      el.scrollLeft = dragState.current.startScroll - dx;
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (el && dragState.current.moved && el.hasPointerCapture?.(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    dragState.current.isDown = false;
    if (el) el.style.cursor = "grab";
  };

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          className="hidden md:flex absolute -left-3 top-[35%] -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center bg-white"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
        >
          <ChevronLeft size={19} className="text-gray-700" />
        </button>
      )}

      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="flex gap-3 overflow-x-auto px-4 md:px-14 pb-3 select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab", overscrollBehaviorX: "contain" }}
      >
        {list.map((product) => (
          <div
            key={product.id}
            style={{ width: `${CARD_WIDTH}px`, minWidth: `${CARD_WIDTH}px`, flexShrink: 0 }}
            onClickCapture={(e) => {
              if (dragState.current.moved) { e.preventDefault(); e.stopPropagation(); }
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {canRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          className="hidden md:flex absolute -right-3 top-[35%] -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center bg-white"
          style={{ border: "1px solid #E5E7EB", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
        >
          <ChevronRight size={19} className="text-gray-700" />
        </button>
      )}
    </div>
  );
}

type Section = { id: string; name: string; subtitle?: string | null };

function SectionRow({ section }: { section: Section }) {
  const [products, setProducts] = useState<ShopProductType[]>([]);

  useEffect(() => {
    fetch(`/api/shop-products?sectionId=${section.id}`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d?.products) ? d.products.filter(Boolean) : [];
        setProducts(list);
      })
      .catch(() => setProducts([]));
  }, [section.id]);

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5 }}
      className="w-full py-5 bg-white"
    >
      <div className="flex items-end justify-between px-4 md:px-14 mb-4">
        <div>
          <h2 className="text-[19px] md:text-[21px] font-extrabold text-gray-900">{section.name}</h2>
          {section.subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{section.subtitle}</p>}
        </div>
        <Link href="/shop/products" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "#14532D" }}>
          See All <ChevronRightIcon size={14} />
        </Link>
      </div>

      <HorizontalProductRow products={products} />
    </motion.div>
  );
}

export default function ProductSections() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch("/api/shop-sections")
      .then((r) => r.json())
      .then((d) => setSections(Array.isArray(d?.sections) ? d.sections : []))
      .catch(() => setSections([]));
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="w-full">
      {sections.map((section) => (
        <SectionRow key={section.id} section={section} />
      ))}
    </div>
  );
}
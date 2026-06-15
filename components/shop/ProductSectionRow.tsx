"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ProductCard, { type ShopProductType } from "./ProductCard";
import Link from "next/link";

type Section = { id: string; name: string; subtitle?: string | null };

function SectionRow({ section }: { section: Section }) {
  const [products, setProducts] = useState<ShopProductType[]>([]);

  useEffect(() => {
    fetch(`/api/shop-products?sectionId=${section.id}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, [section.id]);

  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5 }}
      className="w-full py-5"
    >
      {/* Section header */}
      <div className="flex items-end justify-between px-4 md:px-6 mb-4">
        <div>
          <h2 className="text-[18px] md:text-[20px] font-extrabold text-gray-900">
            {section.name}
          </h2>
          {section.subtitle && (
            <p className="text-[13px] text-gray-500 mt-0.5">{section.subtitle}</p>
          )}
        </div>
        <Link href="/shop/products" className="flex items-center gap-1 text-[13px] font-semibold text-brand-purple-deep hover:underline">
          See All <ChevronRight size={14} />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-3 overflow-x-auto px-4 md:px-6 pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
}

export default function ProductSections() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch("/api/shop-sections")
      .then((r) => r.json())
      .then((d) => setSections(d.sections || []))
      .catch(() => {});
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="w-full" style={{ backgroundColor: "#FFFFFF" }}>
      {sections.map((section) => (
        <SectionRow key={section.id} section={section} />
      ))}
    </div>
  );
}
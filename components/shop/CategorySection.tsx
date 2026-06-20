"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; image?: string | null };

export default function CategorySection() {
  const router = useRouter();
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { setCats(d.categories || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || cats.length === 0) return null;

  return (
    <section className="w-full py-6" style={{ backgroundColor: "#ffffff" }}>
      <div className="w-full px-3 md:px-6">
        <h2 className="text-[17px] md:text-[19px] font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>

        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cats.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              onClick={() => router.push("/shop/products")}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
              style={{ width: "clamp(120px, 14vw, 160px)" }}
            >
              <div
                className="w-full flex items-center justify-center bg-white transition-all duration-200 group-hover:shadow-md"
                style={{ border: "1px solid #E5E7EB", borderRadius: "10px", aspectRatio: "1 / 1", padding: "18px" }}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0ECF9" }}>
                    <span className="text-2xl font-bold" style={{ color: "#4C1D95" }}>{cat.name[0]}</span>
                  </div>
                )}
              </div>

              <p className="text-[13px] md:text-[14px] font-semibold text-gray-900 text-center mt-2.5 leading-tight">
                {cat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
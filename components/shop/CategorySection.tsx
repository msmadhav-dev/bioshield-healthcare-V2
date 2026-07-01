"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  gradient?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  imageSize?: number | null;
};

const FALLBACK_GRADIENTS = [
  ["#F3FBF5", "#B9E9CB"], // green
  ["#F5F2FD", "#C9B8F0"], // purple
  ["#FDF2F1", "#F5B3AD"], // red
  ["#F1FAFD", "#ADE0F2"], // blue
  ["#FFF8EC", "#FBCE8C"], // orange
  ["#FDF2F8", "#F3B8D8"], // pink
];

function categoryImage(category: Category) {
  return category.imageUrl || category.image || category.icon || "";
}

function categoryGradient(category: Category, index: number) {
  if (category.gradient) return category.gradient;

  const fallback = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const from = category.gradientFrom || fallback[0];
  const to = category.gradientTo || fallback[1];

  return `radial-gradient(130% 130% at 50% 38%, ${from} 0%, ${to} 100%)`;
}

function getImageSize(category: Category) {
  const size = Number(category.imageSize || 54);
  return Math.min(90, Math.max(35, size));
}

export default function CategorySection() {
  const rowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const [categories, setCategories] = useState<Category[]>([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d.categories) ? d.categories : []))
      .catch(() => setCategories([]));
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.name?.trim()),
    [categories]
  );

  const updateArrows = () => {
    const row = rowRef.current;
    if (!row) return;

    setCanLeft(row.scrollLeft > 6);
    setCanRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 6);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [visibleCategories.length]);

  const scroll = (direction: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;

    drag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: row.scrollLeft,
    };

    row.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row || !drag.current.active) return;

    row.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.startX);
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  if (!visibleCategories.length) return null;

  return (
    <section className="w-full bg-white py-6 md:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-[1320px] px-4 xl:px-0">
        <div className="mb-4 md:mb-5 flex items-center justify-between border-b border-[#E4EAF1] pb-4 md:pb-7">
          <h2 className="text-[20px] font-bold leading-tight text-[#071D3A] sm:text-[28px] md:text-[36px]">
            Shop by Category
          </h2>

          {(canLeft || canRight) && (
            <div className="hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canLeft}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE5EE] bg-white transition hover:border-[var(--shop-primary-green)] disabled:opacity-35"
                aria-label="Previous categories"
              >
                <img src="/next.svg" alt="" className="h-4 w-4 rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canRight}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE5EE] bg-white transition hover:border-[var(--shop-primary-green)] disabled:opacity-35"
                aria-label="Next categories"
              >
                <img src="/next.svg" alt="" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={rowRef}
          onScroll={updateArrows}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          className="flex cursor-grab snap-x snap-mandatory gap-3 md:gap-5 overflow-x-auto pb-3 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleCategories.map((category, index) => {
            const image = categoryImage(category);
            const imageSize = getImageSize(category);

            return (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(category.slug || category.id)}`}
                className="flex w-[128px] md:w-[170px] flex-none snap-start flex-col items-center text-center"
                draggable={false}
              >
                <div
                  className="relative flex h-[145px] w-[128px] md:h-[190px] md:w-[170px] items-center justify-center overflow-hidden rounded-[16px]"
                  style={{ background: categoryGradient(category, index) }}
                >
                  <div
                    className="relative flex flex-shrink-0 items-center justify-center rounded-full w-[76px] h-[76px] md:w-[104px] md:h-[104px]"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.55)",
                      border: "1.5px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 0 26px 8px rgba(255,255,255,0.45)",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={category.name}
                        draggable={false}
                        loading="lazy"
                        className="object-contain drop-shadow-[0_10px_12px_rgba(7,29,58,0.14)]"
                        style={{
                          width: `${imageSize}%`,
                          height: `${imageSize}%`,
                        }}
                      />
                    ) : (
                      <span className="px-3 text-sm font-bold text-[#071D3A]">{category.name}</span>
                    )}
                  </div>
                </div>

                <h3 className="mt-2 md:mt-3 text-[13px] md:text-[16px] font-semibold leading-tight text-[#071D3A]">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
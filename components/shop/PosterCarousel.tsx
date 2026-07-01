"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Poster = { id: string; image: string; linkUrl?: string | null; order: number };

const AUTO_ADVANCE_MS = 4000;
const TRACK_WIDTH      = 120; // px — the nav bar's track width
const REPEAT           = 3;   // how many copies of the poster list we render back-to-back

export function usePosters() {
  const [posters, setPosters] = useState<Poster[]>([]);

  useEffect(() => {
    fetch("/api/posters")
      .then((r) => r.json())
      .then((d) => setPosters(Array.isArray(d?.posters) ? d.posters : []))
      .catch(() => setPosters([]));
  }, []);

  return posters;
}

export function usePosterSectionConfig() {
  const [config, setConfig] = useState<{ enabled: boolean; position: number } | null>(null);

  useEffect(() => {
    fetch("/api/poster-section-config")
      .then((r) => r.json())
      .then((d) => setConfig(d?.config || { enabled: false, position: 0 }))
      .catch(() => setConfig({ enabled: false, position: 0 }));
  }, []);

  return config;
}

export default function PosterCarousel() {
  const posters = usePosters();
  const router = useRouter();
  const n = posters.length;

  const scrollRef    = useRef<HTMLDivElement>(null);
  const dragState    = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });
  const initialized  = useRef(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex]   = useState(0); // which real poster is currently active (for arrows/nav bar)

  // True infinite loop in both directions: render 3 copies of the list
  // back-to-back and always keep the scroll position inside the *middle*
  // copy. The instant the position drifts into copy 1 or copy 3 (from a
  // drag, a swipe, an arrow click, or auto-advance — doesn't matter which),
  // we silently jump by exactly one copy-width the moment scrolling settles.
  // Since every copy is pixel-identical, that jump is invisible — there's
  // always a full copy of cards to scroll into no matter which direction
  // you keep going, so it never visibly reaches an end.
  const tripled = n > 1 ? Array.from({ length: REPEAT }, () => posters).flat() : posters;

  const cardStep = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const first = el.querySelector<HTMLElement>("[data-poster-card]");
    if (!first) return 0;
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || "0");
    return first.offsetWidth + gap;
  }, []);

  // Start in the middle copy, not copy 1.
  useEffect(() => {
    if (initialized.current || n < 2 || !scrollRef.current) return;
    const step = cardStep();
    if (!step) return;
    scrollRef.current.scrollLeft = n * step;
    initialized.current = true;
  }, [n, cardStep]);

  // Keeps the active-poster index in sync with wherever the track actually
  // is (needed for both the live drag/scroll and the recenter jump), and
  // recenters back into the middle copy once the position drifts out of it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || n < 2) return;

    let settleTimer: ReturnType<typeof setTimeout>;

    const updateIndex = () => {
      const step = cardStep();
      if (!step) return;
      const raw = Math.round(el.scrollLeft / step);
      setIndex(((raw % n) + n) % n);
    };

    const recenter = () => {
      const step = cardStep();
      if (!step) return;
      const setWidth = n * step;
      if (el.scrollLeft < setWidth * 0.5) {
        el.scrollLeft += setWidth;
      } else if (el.scrollLeft >= setWidth * 1.5) {
        el.scrollLeft -= setWidth;
      }
      updateIndex();
    };

    const onScroll = () => {
      updateIndex();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(recenter, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend" as "scroll", recenter);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend" as "scroll", recenter);
      clearTimeout(settleTimer);
    };
  }, [n, cardStep]);

  const step = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el || n < 2) return;
    el.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // native touch scroll handles this fine on its own
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = { isDown: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    setPaused(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.isDown || !scrollRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    scrollRef.current.scrollLeft = dragState.current.startScroll - dx;
  };

  const endDrag = () => {
    dragState.current.isDown = false;
    setTimeout(() => setPaused(false), 300);
  };

  // Auto-advance — pauses while dragging or hovered. Always forward, loops forever.
  useEffect(() => {
    if (n < 2 || paused) return;
    const id = setInterval(() => step(1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, paused]);

  if (n === 0) return null;

  return (
    <div
      className="relative w-full py-6 md:py-8"
      style={{ backgroundColor: "#FFFFFF" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto w-full max-w-[1320px]">
        {/* Edge fade — left stays as before, right is wider/stronger per request */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 md:w-9"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-28"
          style={{ background: "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 100%)" }} />

        {/* Arrows — bare glyphs, no circle/background */}
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => step(-1)}
              className="absolute left-1 md:left-2 top-1/2 z-20 -translate-y-1/2 text-gray-700 transition-colors hover:text-[var(--shop-primary-green)]"
            >
              <ChevronLeft size={30} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => step(1)}
              className="absolute right-1 md:right-2 top-1/2 z-20 -translate-y-1/2 text-gray-700 transition-colors hover:text-[var(--shop-primary-green)]"
            >
              <ChevronRight size={30} strokeWidth={2.5} />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto px-[10vw] md:gap-6 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ cursor: "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {tripled.map((poster, i) => (
            <div
              key={`${poster.id}-${i}`}
              data-poster-card
              className="flex-none snap-center md:snap-start overflow-hidden rounded-[16px] w-[80vw] md:w-[44%]"
              style={{ aspectRatio: "7 / 5" }}
            >
              <img
                src={poster.image}
                alt=""
                draggable={false}
                className="h-full w-full select-none object-cover"
                onClick={() => {
                  if (dragState.current.moved) return;
                  if (poster.linkUrl) router.push(poster.linkUrl);
                }}
                style={{ cursor: poster.linkUrl ? "pointer" : "default" }}
              />
            </div>
          ))}
        </div>

        {/* Navigation bar — single track with a sliding highlighted segment */}
        {n > 1 && (
          <div className="mt-4 pl-4 md:pl-10">
            <div className="relative rounded-full" style={{ width: `${TRACK_WIDTH}px`, height: "6px", backgroundColor: "#E9EAEC" }}>
              <div
                className="absolute top-0 h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${TRACK_WIDTH / n}px`,
                  left: `${(index / n) * TRACK_WIDTH}px`,
                  backgroundColor: "var(--shop-primary-green)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
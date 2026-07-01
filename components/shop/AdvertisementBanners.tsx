"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import {
  ADVERTISEMENT_THEME_OPTIONS,
  SLOT_DEFAULT_THEMES,
  type AdvertisementThemeKey,
} from "@/lib/advertisementThemes";

export type Ad = {
  id: string;
  slot: number;
  badge?: string | null;
  topCaption?: string | null;
  heading: string;
  subText?: string | null;
  productName: string;
  linkUrl?: string | null;
  image?: string | null;
  imageSize?: number;
  imageSizeMobile?: number;
  titleSizeDesktop?: number;
  titleSizeMobile?: number;
  captionSizeDesktop?: number;
  captionSizeMobile?: number;
  buttonSizeDesktop?: number;
  buttonSizeMobile?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageOffsetXMobile?: number;
  imageOffsetYMobile?: number;
  theme?: AdvertisementThemeKey | null;
  buttonText?: string | null;
};

// ── Fixed text/brand colors, not theme-dependent. ──
const TITLE_COLOR    = "#17395B";
const CATEGORY_COLOR = "#5E7694";
const BADGE_BG       = "#FF9D2F";
const BUTTON_GREY    = "#6B7280";

function getTheme(slot: number, theme?: string | null) {
  const key = (theme as AdvertisementThemeKey) || SLOT_DEFAULT_THEMES[slot] || "orange";
  return ADVERTISEMENT_THEME_OPTIONS[key];
}

function adHref(ad: Ad) {
  if (ad.linkUrl?.trim()) return ad.linkUrl.trim();
  return `/shop/products/${encodeURIComponent(ad.productName)}`;
}

function buttonLabel(ad?: Ad) {
  return ad?.buttonText?.trim() || "Buy now";
}

function TitleText({ text }: { text: string }) {
  const idx = text.indexOf(" ");
  if (idx === -1) return <>{text}</>;
  return (
    <>
      <span style={{ fontWeight: 700 }}>{text.slice(0, idx)}</span>
      <span style={{ fontWeight: 400 }}>{text.slice(idx)}</span>
    </>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: BADGE_BG, padding: "3px 6px" }}
    >
      {label}
    </span>
  );
}

function CardButton({ label, scalePercent = 100 }: { label: string; scalePercent?: number }) {
  return (
    <span
      className="inline-flex h-8 items-center gap-1.5 rounded-full pl-4 pr-3 text-[12px] font-semibold text-white transition-colors duration-300 md:h-10 md:pl-[18px] md:pr-4 md:text-[14px]"
      style={{
        backgroundColor: BUTTON_GREY,
        transform: `scale(${scalePercent / 100})`,
        transformOrigin: "left center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shop-primary-green)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BUTTON_GREY)}
    >
      {label}
      <ArrowRight size={14} />
    </span>
  );
}

function Blob({
  src, sizePx = 320, bottomPx = -120, rightPx = -40,
}: {
  src: string;
  sizePx?: number;
  bottomPx?: number;
  rightPx?: number;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute z-0 object-contain"
      style={{
        right: `${rightPx}px`,
        bottom: `${bottomPx}px`,
        width: `${sizePx}px`,
        opacity: 0.20,
      }}
    />
  );
}

function DraggableImage({
  src, alt, offsetX, offsetY, sizePercent = 100, editable, onOffsetChange,
}: {
  src: string;
  alt: string;
  offsetX: number;
  offsetY: number;
  sizePercent?: number;
  editable?: boolean;
  onOffsetChange?: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { startX: e.clientX, startY: e.clientY, startOffsetX: offsetX, startOffsetY: offsetY };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      if (!dragState.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - dragState.current.startX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragState.current.startY) / rect.height) * 100;
      const nextX = Math.max(-40, Math.min(40, Math.round(dragState.current.startOffsetX + dxPct)));
      const nextY = Math.max(-40, Math.min(40, Math.round(dragState.current.startOffsetY + dyPct)));
      onOffsetChange?.(nextX, nextY);
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, onOffsetChange]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{ cursor: editable ? (dragging ? "grabbing" : "grab") : "default" }}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        onMouseDown={handleMouseDown}
        className="block object-contain"
        style={{
          // Real layout sizing instead of transform:scale() — scale() was
          // painting the image bigger from its own center *after* layout,
          // which (combined with a drag offset) pushed most of it past the
          // card edge on one side and looked like it was cropped through
          // the middle. maxWidth/maxHeight instead resize the image's
          // actual box, so it grows evenly from its centered position and
          // only the true excess gets clipped by the card's rounded edge.
          maxWidth: `${sizePercent}%`,
          maxHeight: `${sizePercent}%`,
          transform: `translate(${offsetX}%, ${offsetY}%)`,
          filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.12))",
          userSelect: "none",
        }}
      />
    </div>
  );
}

type CardSize = "horizontal" | "stacked";

function PromoCard({
  ad, theme, size, blobSizePx = 320, blobBottomPx = -120, blobRightPx = -40, reverse = false, showButton = true,
  imageSizePercent = 100, titleSizePercent = 100, captionSizePercent = 100, buttonSizePercent = 100,
  offsetX = 0, offsetY = 0,
  editable, onOffsetChange, onClick,
}: {
  ad: Ad;
  theme: { background: string; styleImage: string };
  size: CardSize;
  blobSizePx?: number;
  blobBottomPx?: number;
  blobRightPx?: number;
  reverse?: boolean;
  showButton?: boolean;
  imageSizePercent?: number;
  titleSizePercent?: number;
  captionSizePercent?: number;
  buttonSizePercent?: number;
  offsetX?: number;
  offsetY?: number;
  editable?: boolean;
  onOffsetChange?: (x: number, y: number) => void;
  onClick?: () => void;
}) {
  const baseTitlePx = size === "stacked" ? 26 : 23;
  const titleSize = `${Math.round(baseTitlePx * (titleSizePercent / 100))}px`;
  const captionSize = `${Math.round(13 * (captionSizePercent / 100))}px`;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[16px] p-6"
      style={{ background: theme.background, cursor: "pointer" }}
      onClick={onClick}
    >
      <Blob src={theme.styleImage} sizePx={blobSizePx} bottomPx={blobBottomPx} rightPx={blobRightPx} />

      <div className={`relative z-[1] flex h-full ${size === "horizontal" ? `items-center gap-5 ${reverse ? "flex-row-reverse" : "flex-row"}` : "flex-col gap-3"}`}>
        <div className={size === "horizontal" ? "flex min-w-0 flex-1 flex-col" : "flex flex-shrink-0 flex-col"}>
          {ad.badge ? <div className="mb-2.5"><Badge label={ad.badge} /></div> : null}

          {ad.topCaption ? (
            <p className="mb-1" style={{ fontSize: captionSize, fontWeight: 500, color: CATEGORY_COLOR }}>
              {ad.topCaption}
            </p>
          ) : null}

          <h3 className="mb-4" style={{ fontSize: titleSize, color: TITLE_COLOR, lineHeight: 1.2 }}>
            <TitleText text={ad.heading} />
          </h3>

          {showButton ? <div><CardButton label={buttonLabel(ad)} scalePercent={buttonSizePercent} /></div> : null}
        </div>

        <div className={size === "horizontal" ? "flex h-full min-w-0 flex-1 items-center justify-center" : "flex min-h-0 flex-1 items-center justify-center"}>
          {ad.image ? (
            <DraggableImage
              src={ad.image}
              alt={ad.heading}
              offsetX={offsetX}
              offsetY={offsetY}
              sizePercent={imageSizePercent}
              editable={editable}
              onOffsetChange={onOffsetChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ slot, admin }: { slot: number; admin?: boolean }) {
  const theme = getTheme(slot);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] p-6"
      style={{ background: theme.background, cursor: admin ? "pointer" : "default" }}
    >
      <Blob src={theme.styleImage} />
      {admin ? (
        <div className="relative z-[1] text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(23,57,91,0.08)" }}>
            <Plus size={26} style={{ color: TITLE_COLOR }} />
          </div>
          <p className="text-[15px] font-bold" style={{ color: TITLE_COLOR }}>Slot {slot}</p>
          <p className="mt-1 text-[13px]" style={{ color: CATEGORY_COLOR }}>Click to add banner</p>
        </div>
      ) : null}
    </div>
  );
}

// ── Mobile blob sizes ──────────────────────────────────────────────────────
// Two values instead of a 4-key table: change MOBILE_MAIN_BLOB_PX to resize
// the big banner (slot 1) independently; change MOBILE_SECONDARY_BLOB_PX to
// resize all smaller banners (slots 2/3/4/5) at once with one number.
const MOBILE_MAIN_BLOB_PX      = 400; // slot 1 — main banner
const MOBILE_SECONDARY_BLOB_PX = 260; // slots 2/3/4/5 — all share this

// ── Desktop blob values ────────────────────────────────────────────────────
// Grid dimensions for reference (12 cols, 24px gap, 250px row height,
// max-width 1320px): slot 1/5 ≈ 648×250px, slot 2/4 ≈ 312×250px,
// slot 3 ≈ 312×524px (spans two rows).
// blobSizePx = blob image width in px
// blobBottomPx = how far below the card's bottom edge (more negative = more hidden)
// blobRightPx  = how far past the card's right edge  (more negative = further right)
function resolveLayout(slot: number, isMain?: boolean): { size: CardSize; blobSizePx: number; blobBottomPx: number; blobRightPx: number; reverse: boolean; showButton: boolean } {
  const showButton = slot !== 2;
  if (isMain !== undefined) {
    const mobileBlobSizePx = isMain ? MOBILE_MAIN_BLOB_PX : MOBILE_SECONDARY_BLOB_PX;
    return isMain
      ? { size: "horizontal", blobSizePx: mobileBlobSizePx, blobBottomPx: -100, blobRightPx: -40, reverse: true,  showButton }
      : { size: "stacked",    blobSizePx: mobileBlobSizePx, blobBottomPx: -60,  blobRightPx: -40, reverse: false, showButton };
  }
  if (slot === 1) return { size: "horizontal", blobSizePx: 600, blobBottomPx: -300, blobRightPx: -200, reverse: true,  showButton }; // large slot
  if (slot === 2) return { size: "stacked",    blobSizePx: 400, blobBottomPx: -150, blobRightPx:  -40, reverse: false, showButton }; // small slot
  if (slot === 3) return { size: "stacked",    blobSizePx: 800, blobBottomPx: -150, blobRightPx:  -40, reverse: false, showButton }; // tall slot
  if (slot === 4) return { size: "horizontal", blobSizePx: 400, blobBottomPx: -150, blobRightPx:  -40, reverse: false, showButton }; // small slot
  return            { size: "horizontal", blobSizePx: 600, blobBottomPx: -300, blobRightPx: -200, reverse: false, showButton };       // large slot
}

export function Banner({
  ad,
  slot,
  admin = false,
  isMain,
  editable,
  onOffsetChange,
  onAdminClick,
}: {
  ad?: Ad;
  slot: number;
  admin?: boolean;
  isMain?: boolean;
  editable?: boolean;
  onOffsetChange?: (x: number, y: number) => void;
  onAdminClick?: () => void;
}) {
  const router = useRouter();

  if (!ad) {
    return <EmptyCard slot={slot} admin={admin} />;
  }

  const layout = resolveLayout(slot, isMain);
  const isMobileContext = isMain !== undefined;

  const imageSizePercent   = isMobileContext ? (ad.imageSizeMobile   ?? 100) : (ad.imageSize          ?? 100);
  const titleSizePercent   = isMobileContext ? (ad.titleSizeMobile   ?? 100) : (ad.titleSizeDesktop    ?? 100);
  const captionSizePercent = isMobileContext ? (ad.captionSizeMobile ?? 100) : (ad.captionSizeDesktop  ?? 100);
  const buttonSizePercent  = isMobileContext ? (ad.buttonSizeMobile  ?? 100) : (ad.buttonSizeDesktop   ?? 100);
  const offsetX            = isMobileContext ? (ad.imageOffsetXMobile ?? 0) : (ad.imageOffsetX ?? 0);
  const offsetY            = isMobileContext ? (ad.imageOffsetYMobile ?? 0) : (ad.imageOffsetY ?? 0);

  const handleClick = () => {
    if (admin) {
      onAdminClick?.();
      return;
    }
    router.push(adHref(ad));
  };

  return (
    <PromoCard
      ad={ad}
      theme={getTheme(slot, ad.theme)}
      size={layout.size}
      blobSizePx={layout.blobSizePx}
      blobBottomPx={layout.blobBottomPx}
      blobRightPx={layout.blobRightPx}
      reverse={layout.reverse}
      showButton={layout.showButton}
      imageSizePercent={imageSizePercent}
      titleSizePercent={titleSizePercent}
      captionSizePercent={captionSizePercent}
      buttonSizePercent={buttonSizePercent}
      offsetX={offsetX}
      offsetY={offsetY}
      editable={editable}
      onOffsetChange={onOffsetChange}
      onClick={handleClick}
    />
  );
}

export function useAdvertisements() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/advertisements")
      .then((r) => r.json())
      .then((d) => setAds(d.advertisements || []))
      .catch(() => {});
  }, []);

  return ads;
}

export default function AdvertisementBanners() {
  const ads = useAdvertisements();
  const getSlot = (slot: number) => ads.find((item) => item.slot === slot);

  return (
    <section className="hidden w-full bg-white pb-4 pt-8 md:block md:pt-12">
      <div
        className="mx-auto grid max-w-[1320px] grid-cols-12 gap-6 px-4 xl:px-0"
        style={{ gridAutoRows: "280px" }}
      >
        <div className="col-span-6 row-span-1">
          <Banner ad={getSlot(1)} slot={1} />
        </div>

        <div className="col-span-3 row-span-1">
          <Banner ad={getSlot(2)} slot={2} />
        </div>

        <div className="col-span-3 row-span-2">
          <Banner ad={getSlot(3)} slot={3} />
        </div>

        <div className="col-span-3 row-span-1">
          <Banner ad={getSlot(4)} slot={4} />
        </div>

        <div className="col-span-6 row-span-1">
          <Banner ad={getSlot(5)} slot={5} />
        </div>
      </div>
    </section>
  );
}
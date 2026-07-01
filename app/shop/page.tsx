"use client";

import AdvertisementBanners, { Banner, useAdvertisements } from "@/components/shop/AdvertisementBanners";
import CategorySection                                      from "@/components/shop/CategorySection";
import { SectionRow, useShopSections, type Section }         from "@/components/shop/ProductSectionRow";
import PosterCarousel, { usePosterSectionConfig }             from "@/components/shop/PosterCarousel";

function MobileBannerSlot({
  slot, ads, isMain = false, height,
}: {
  slot: number;
  ads: ReturnType<typeof useAdvertisements>;
  isMain?: boolean;
  height: string;
}) {
  const ad = ads.find((a) => a.slot === slot);
  return (
    <div className="px-3" style={{ height }}>
      <Banner ad={ad} slot={slot} isMain={isMain} />
    </div>
  );
}

type Block = { kind: "section"; section: Section } | { kind: "poster" };

// Splices the poster carousel into the section list at the admin-configured
// position (position N = after the Nth section, 0 = before all of them).
// When the poster section is disabled this is just `sections` 1:1, so
// nothing changes for anyone who hasn't set it up.
function useSectionBlocks(): Block[] {
  const sections = useShopSections();
  const posterConfig = usePosterSectionConfig();

  const blocks: Block[] = [];
  sections.forEach((section, i) => {
    if (posterConfig?.enabled && posterConfig.position === i) blocks.push({ kind: "poster" });
    blocks.push({ kind: "section", section });
  });
  if (posterConfig?.enabled && posterConfig.position >= sections.length) {
    blocks.push({ kind: "poster" });
  }

  return blocks;
}

function DesktopShopLayout() {
  const blocks = useSectionBlocks();

  return (
    <div className="w-full">
      {blocks.map((b, i) =>
        b.kind === "poster" ? (
          <PosterCarousel key={`poster-${i}`} />
        ) : (
          <SectionRow key={b.section.id} section={b.section} />
        )
      )}
    </div>
  );
}

// Mobile-only ordering: banner 1 (top) → categories → row 1 → banner 2 →
// row 2 → banner 3 → row 3 → banner 4 → row 4 → banner 5 → remaining rows.
// "Row" here is either a product section or the poster carousel — whichever
// the admin-configured position lands on. Desktop keeps its own layout above.
function MobileShopLayout() {
  const ads    = useAdvertisements();
  const blocks = useSectionBlocks();
  const adSlots = [2, 3, 4, 5];

  return (
    <div className="block md:hidden">
      <div className="pt-4 pb-3" style={{ backgroundColor: "#FFFFFF" }}>
        <MobileBannerSlot slot={1} ads={ads} isMain height="300px" />
      </div>

      <CategorySection />

      {blocks.map((b, i) => (
        <div key={i}>
          {b.kind === "poster" ? <PosterCarousel /> : <SectionRow section={b.section} />}

          {i < adSlots.length && (
            <div className="py-3" style={{ backgroundColor: "#FFFFFF" }}>
              <MobileBannerSlot slot={adSlots[i]} ads={ads} height="340px" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  return (
    <main className="pt-[148px] md:pt-[68px]" style={{ backgroundColor: "#F7F7F7", minHeight: "100vh" }}>
      {/* Desktop — unchanged order */}
      <div className="hidden md:block">
        <AdvertisementBanners />
        <CategorySection />
        <DesktopShopLayout />
      </div>

      {/* Mobile — interleaved order */}
      <MobileShopLayout />
    </main>
  );
}
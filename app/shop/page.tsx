"use client";

import AdvertisementBanners, { Banner, useAdvertisements } from "@/components/shop/AdvertisementBanners";
import CategorySection                                      from "@/components/shop/CategorySection";
import ProductSections, { SectionRow, useShopSections }      from "@/components/shop/ProductSectionRow";

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

// Mobile-only ordering: banner 1 → categories → row 1 → banner 2 → row 2 →
// banner 3 → row 3 → banner 4 → remaining rows. Desktop keeps its own layout below.
function MobileShopLayout() {
  const ads      = useAdvertisements();
  const sections = useShopSections();

  return (
    <div className="block md:hidden">
      <div className="pt-4 pb-3" style={{ backgroundColor: "#FFFFFF" }}>
        <MobileBannerSlot slot={1} ads={ads} isMain height="300px" />
      </div>

      <CategorySection />

      {sections[0] && <SectionRow section={sections[0]} />}

      <div className="py-3" style={{ backgroundColor: "#FFFFFF" }}>
        <MobileBannerSlot slot={2} ads={ads} height="185px" />
      </div>

      {sections[1] && <SectionRow section={sections[1]} />}

      <div className="py-3" style={{ backgroundColor: "#FFFFFF" }}>
        <MobileBannerSlot slot={3} ads={ads} height="185px" />
      </div>

      {sections[2] && <SectionRow section={sections[2]} />}

      <div className="py-3" style={{ backgroundColor: "#FFFFFF" }}>
        <MobileBannerSlot slot={4} ads={ads} height="185px" />
      </div>

      {sections.slice(3).map((s) => <SectionRow key={s.id} section={s} />)}
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
        <ProductSections />
      </div>

      {/* Mobile — interleaved order */}
      <MobileShopLayout />
    </main>
  );
}
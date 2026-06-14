import CategorySection       from "@/components/shop/CategorySection";
import AdvertisementBanners  from "@/components/shop/AdvertisementBanners";

export default function ShopPage() {
  return (
    <main className="pt-[148px] md:pt-[68px]" style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <AdvertisementBanners />
      <CategorySection />
      {/* Product grid — coming next */}
    </main>
  );
}
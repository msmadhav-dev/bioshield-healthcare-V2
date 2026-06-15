import AdvertisementBanners  from "@/components/shop/AdvertisementBanners";
import CategorySection       from "@/components/shop/CategorySection";
import ProductSections       from "@/components/shop/ProductSectionRow";

export default function ShopPage() {
  return (
    <main className="pt-[148px] md:pt-[68px]" style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <AdvertisementBanners />
      <CategorySection />
      <ProductSections />
    </main>
  );
}
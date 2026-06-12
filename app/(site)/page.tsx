import HeroSlider               from "@/components/site/HeroSlider";
import CertificationStrip       from "@/components/site/CertificationStrip";
import StatsSection             from "@/components/site/StatsSection";
import AboutSection             from "@/components/site/AboutSection";
import ProductCategoriesSection from "@/components/site/ProductCategoriesSection";
import ProductCardsSection      from "@/components/site/ProductCardsSection";
import ContactSection           from "@/components/site/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white pt-[70px]">
      <HeroSlider />
      <CertificationStrip />
      <StatsSection />
      <AboutSection />
      <ProductCategoriesSection />
      <ProductCardsSection />
      <ContactSection />
    </main>
  );
}
import type { Metadata } from "next";
import ShopNavbar from "@/components/shop/ShopNavbar";

export const metadata: Metadata = {
  title: "Bioshield Healthcare — Online Shop",
  description: "Shop genuine pharmaceutical products from Bioshield Healthcare.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#F7F7F7", minHeight: "100vh", overflowX: "hidden", overflowY: "visible" }}>
      <ShopNavbar cartCount={0} />
      {children}
    </div>
  );
}
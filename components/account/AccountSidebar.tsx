"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";

const NAV_ITEMS = [
  { href: "/shop/account",               label: "Dashboard",          icon: "/icons/dashboard.svg" },
  { href: "/shop/cart",                  label: "Cart",               icon: "/icons/cart.svg" },
  { href: "/shop/account/liked",         label: "Liked Products",     icon: "/icons/heart.svg" },
  { href: "/shop/account/orders",        label: "My Orders",          icon: "/icons/orders.svg" },
  { href: "/shop/account/wallet",        label: "Wallet",             icon: "/icons/wallet.svg" },
  { href: "/shop/account/transactions",  label: "Transactions",       icon: "/icons/transactions.svg" },
  { href: "/shop/account/help",          label: "Help & Support",     icon: "/icons/help.svg" },
];

export default function AccountSidebar({
  onLogoutClick,
}: {
  onLogoutClick: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // No flex-1 here anymore — that was what pushed Logout all the way to the
  // bottom of the sidebar. Now it just sits right after the last nav item.
  const NavList = () => (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
            style={{
              backgroundColor: active ? "#F0FDF4" : "transparent",
              color:           active ? "#14532D" : "#374151",
            }}
          >
            <img src={item.icon} alt="" style={{ width: 20, height: 20 }} className="flex-shrink-0" />
            <span className="text-[14px] font-semibold whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = ({ onClick }: { onClick: () => void }) => (
    <div className="px-3 mt-2 pb-4">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl w-full text-[14px] font-bold"
        style={{ background: YELLOW_GRADIENT, color: "#1A1A1A" }}
      >
        <img src="/icons/logout.svg" alt="" style={{ width: 18, height: 18 }} className="flex-shrink-0" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop: always expanded, rounded like the content cards, and
           truly fixed in the viewport — not sticky. Sticky depends on every
           single ancestor having correct overflow behavior to compute the
           right "nearest scrolling ancestor", which is fragile (that's
           exactly what broke last time). Fixed positioning is relative to
           the viewport itself, so it can't be derailed by an ancestor's
           overflow setting. The left offset below is computed with CSS
           max()/calc() to land exactly where the sidebar would sit inside
           the centered max-width:1500px, px-8 layout in layout.tsx. ── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 fixed z-30"
        style={{
          width:           "240px",
          top:             "80px",
          left:            "max(32px, calc((100vw - 1500px) / 2 + 32px))",
          maxHeight:       "calc(100vh - 96px)",
          overflowY:       "auto",
          backgroundColor: "#FFFFFF",
          borderRadius:    "24px",
          border:          "1px solid #EFEFEF",
        }}
      >
        <NavList />
        <LogoutButton onClick={onLogoutClick} />
      </aside>

      {/* ── Mobile: hamburger as a floating button, fixed in the viewport
           through the entire scroll. top-[100px] matches the account
           layout's reduced top padding, so it always sits just below the
           navbar instead of drifting into empty space. ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[100px] left-3 z-40 w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <img src="/icons/hamburger.svg" alt="" style={{ width: 18, height: 18 }} />
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(15,23,42,0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed top-0 left-0 h-full z-50 flex flex-col"
            style={{ width: "240px", backgroundColor: "#FFFFFF" }}
          >
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <span className="text-[15px] font-extrabold text-gray-900">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: "#F4F6F8" }}>
                <img src="/icons/close.svg" alt="" style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <NavList />
            <LogoutButton onClick={() => { setMobileOpen(false); onLogoutClick(); }} />
          </aside>
        </>
      )}
    </>
  );
}
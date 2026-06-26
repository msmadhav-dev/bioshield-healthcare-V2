"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal, { type AuthUser } from "@/components/shop/AuthModal";

const searchTerms = [
  "search for products",
  "healthcare solutions",
  "medicines",
  "dental care",
];

function AnimatedPlaceholder() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % searchTerms.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative block overflow-hidden text-gray-400 text-[13.5px]" style={{ height: "20px" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{    y: -14, opacity: 0 }}
          transition={{ duration: 0.26, ease: "easeInOut" }}
          className="absolute left-0 whitespace-nowrap text-gray-400"
        >
          {searchTerms[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SearchBar({
  compact    = false,
  showButton = true,
}: {
  compact?:    boolean;
  showButton?: boolean;
}) {
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="flex items-center w-full overflow-hidden"
      style={{
        border:          `1.5px solid ${focused ? "#9CA3AF" : "#E0E0E5"}`,
        borderRadius:    "999px",
        backgroundColor: "#FFFFFF",
        height:          compact ? "40px" : "44px",
      }}
    >
      <Search size={15} className="ml-4 flex-shrink-0 text-gray-400" strokeWidth={2} />

      <div className="relative flex-1 overflow-hidden mx-2 h-full flex items-center">
        {!query && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full pointer-events-none">
            <AnimatedPlaceholder />
          </div>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none text-[13.5px] text-gray-800 h-full relative z-10"
        />
      </div>

      {showButton && (
        <button
          type="button"
          className="h-[34px] px-5 mr-[4px] text-white text-[13px] font-semibold flex-shrink-0 transition-colors"
          style={{ backgroundColor: "#166534", borderRadius: "999px" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#14532D")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#166534")}
        >
          Search
        </button>
      )}
    </div>
  );
}

function LocationStrip({ city }: { city?: string | null }) {
  return (
    <button type="button" className="flex items-center gap-2 bg-transparent border-none outline-none cursor-pointer group w-fit">
      <img src="/icons/location.svg" alt="" style={{ width: 18, height: 18 }} className="flex-shrink-0" />
      <span className="text-[12px] text-gray-500">Deliver to</span>
      <span className="text-[13px] font-bold text-gray-800 tracking-tight group-hover:text-brand-purple transition-colors">
        {city || "Chennai"}
      </span>
      <ChevronDown size={13} className="text-gray-500" strokeWidth={2.5} />
    </button>
  );
}

export default function ShopNavbar({
  cartCount  = 0,
  isLoggedIn = false,
  userName   = "",
}: {
  cartCount?:  number;
  isLoggedIn?: boolean;
  userName?:   string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAccountPage = pathname?.startsWith("/shop/account") ?? false;
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore login state from the session cookie on every page load/refresh —
  // this is what fixes "refreshing logs me out".
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setLoggedInUser(d.user); })
      .catch(() => {});
  }, []);

  const handleProfileClick = () => {
    if (loggedInUser) router.push("/shop/account");
    else setAuthOpen(true);
  };

  return (
    <>
      {/* ════════ DESKTOP ════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center w-full h-[68px] gap-8 px-6 xl:px-12"
        style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E8EC" }}
      >
        {/* Logo */}
        <Link href="/shop" className="flex-shrink-0">
          <Image
            src="/Logo-01.png"
            alt="Bioshield"
            width={180}
            height={54}
            priority
            className="h-[120px] w-auto object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </Link>

        {/* Divider */}
        <div className="w-px h-9 bg-gray-200 flex-shrink-0" />

        {/* Location */}
        <button type="button" className="flex items-start gap-2.5 flex-shrink-0 cursor-pointer bg-transparent border-none outline-none group">
          <img src="/icons/location.svg" alt="" style={{ width: 32, height: 32, marginTop: "2px" }} className="flex-shrink-0" />
          <div className="text-left">
            <p className="text-[11px] text-gray-400 leading-none mb-[3px] tracking-wide">Deliver to</p>
            <div className="flex items-center gap-0.5">
              <p className="text-[13.5px] font-bold text-gray-800 leading-none tracking-tight group-hover:text-brand-purple transition-colors">
                {loggedInUser?.city || "Chennai"}
              </p>
              <ChevronDown size={12} className="text-gray-500 mt-[1px]" strokeWidth={2.5} />
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-9 bg-gray-200 flex-shrink-0" />

        {/* Search — fixed medium width */}
        <div style={{ width: "420px" }}>
          <SearchBar />
        </div>

        {/* Right actions pushed to far right */}
        <div className="flex items-center gap-10 flex-shrink-0 ml-auto">

          {/* Login / Profile */}
          <button type="button" onClick={handleProfileClick} className="flex items-center gap-2.5 group">
            <div className="relative flex-shrink-0">
              <img src="/icons/user.svg" alt="" style={{ width: 26, height: 26 }} />
              {!loggedInUser && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />}
            </div>
            <div className="text-left">
              <p className="text-[11px] text-gray-400 leading-none mb-[3px] tracking-wide">Hello,</p>
              <p className="text-[13px] font-bold text-gray-800 leading-none tracking-tight group-hover:text-brand-purple transition-colors">
                {loggedInUser ? loggedInUser.name : (isLoggedIn ? userName : "Log in")}
              </p>
            </div>
          </button>

          {/* Wallet — only shown once logged in */}
          {loggedInUser && (
            <Link href="/shop/account/wallet" className="flex items-center gap-2 group">
              <img src="/icons/wallet.svg" alt="" style={{ width: 22, height: 22 }} />
              <span className="text-[13px] font-bold text-gray-800 tracking-tight group-hover:text-brand-purple transition-colors">
                ₹{(loggedInUser.walletBalance ?? 0).toFixed(0)}
              </span>
            </Link>
          )}

          {/* Cart */}
          <Link href="/shop/cart" className="flex items-center gap-2.5 group">
            <div className="relative flex-shrink-0">
              <img src="/icons/cart.svg" alt="" style={{ width: 42, height: 42 }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] rounded-full text-white flex items-center justify-center text-[9px] font-bold px-0.5"
                  style={{ backgroundColor: "#EF4444" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <p className="text-[13px] font-bold text-gray-800 tracking-tight group-hover:text-brand-purple transition-colors">
              Cart
            </p>
          </Link>

        </div>
      </header>

      {/* ════════ MOBILE ════════ */}
      <div
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
        style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E8EC" }}
      >
        {/* Row 1: Logo + Profile + Cart — hides on scroll, except on account pages where it stays put */}
        <AnimatePresence initial={false}>
          {(!scrolled || isAccountPage) && (
            <motion.div
              key="logo-row"
              initial={{ height: 0,      opacity: 0 }}
              animate={{ height: "56px", opacity: 1 }}
              exit={{    height: 0,      opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 h-[56px]">
                <Link href="/shop">
                  <Image
                    src="/Logo-01.png"
                    alt="Bioshield"
                    width={140}
                    height={42}
                    priority
                    className="h-[120px] w-auto object-contain"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </Link>
                <div className="flex items-center gap-6">
                  <button type="button" onClick={handleProfileClick} className="relative">
                    <img src="/icons/user.svg" alt="" style={{ width: 22, height: 22 }} />
                    {!loggedInUser && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />}
                  </button>
                  {loggedInUser && (
                    <Link href="/shop/account/wallet" className="flex items-center gap-1">
                      <img src="/icons/wallet.svg" alt="" style={{ width: 20, height: 20 }} />
                      <span className="text-[12px] font-bold text-gray-800">₹{(loggedInUser.walletBalance ?? 0).toFixed(0)}</span>
                    </Link>
                  )}
                  <Link href="/shop/cart" className="relative">
                    <img src="/icons/cart.svg" alt="" style={{ width: 34, height: 34 }} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full text-white flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: "#EF4444" }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Location strip — hides on scroll */}
        <AnimatePresence initial={false}>
          {!scrolled && (
            <motion.div
              key="location-row"
              initial={{ height: 0,      opacity: 0 }}
              animate={{ height: "36px", opacity: 1 }}
              exit={{    height: 0,      opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
              style={{ backgroundColor: "#F7F7F9", borderTop: "1px solid #F0F0F5" }}
            >
              <div className="flex items-center px-4 h-[36px]">
                <LocationStrip city={loggedInUser?.city} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3: Search bar — only on the main shop and product pages, hidden on account pages */}
        {!isAccountPage && (
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ backgroundColor: scrolled ? "#FFFFFF" : "#F7F7F7" }}
          >
            <div className="flex-1">
              <SearchBar compact={scrolled} showButton={false} />
            </div>

            {/* Show icons next to search when scrolled */}
            {scrolled && (
              <div className="flex items-center gap-5 flex-shrink-0">
                <button type="button" onClick={handleProfileClick} className="relative">
                  <img src="/icons/user.svg" alt="" style={{ width: 21, height: 21 }} />
                  {!loggedInUser && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }} />}
                </button>
                {loggedInUser && (
                  <Link href="/shop/account/wallet" className="flex items-center gap-1">
                    <img src="/icons/wallet.svg" alt="" style={{ width: 19, height: 19 }} />
                    <span className="text-[11.5px] font-bold text-gray-800">₹{(loggedInUser.walletBalance ?? 0).toFixed(0)}</span>
                  </Link>
                )}
                <Link href="/shop/cart" className="relative">
                  <img src="/icons/cart.svg" alt="" style={{ width: 34, height: 34 }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] rounded-full text-white flex items-center justify-center text-[8px] font-bold"
                      style={{ backgroundColor: "#EF4444" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => setLoggedInUser(user)}
      />
    </>
  );
}

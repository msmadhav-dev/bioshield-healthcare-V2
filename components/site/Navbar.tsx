"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, ChevronDown, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/#about",
    dropdown: [
      { label: "Our Vision & Mission", href: "/vision" },
      { label: "Why Bioshield",        href: "/vision#why" },
    ],
  },
  {
    label: "Products",
    href: "/products",
    dropdown: [
      { label: "General", href: "/products" },
      { label: "Dental",  href: "/products" },
      { label: "Ortho",   href: "/products" },
    ],
  },
  { label: "Contact Us", href: "/#contact" },
];

const dropVariants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.1 } },
};

export default function Navbar() {
  const pathname               = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showTooltip,  setShowTooltip]  = useState(false);

  // Show tooltip on mount (mobile only), auto-hide after 3 seconds
  useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 xl:px-10 flex items-center justify-between h-[70px]">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/Logo-01.png"
            alt="Bioshield Healthcare"
            width={220}
            height={70}
            priority
            className="h-[150px] w-auto object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center">
          <ul className="flex items-center">
            {navLinks.map((link) => {
              const isActive = link.href === "/" && pathname === "/";
              return (
                <li
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    {link.label}
                    {link.dropdown && (
                      <ChevronDown
                        size={13}
                        className="mt-[1px] transition-transform duration-200"
                        style={{
                          transform:
                            openDropdown === link.label
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    )}
                  </Link>

                  {link.dropdown && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          variants={dropVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-0 mt-[6px] w-[210px] bg-white rounded-lg py-2 z-50"
                          style={{
                            boxShadow: "0 4px 24px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.06)",
                            border:    "1px solid var(--nav-border)",
                          }}
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="nav-dropdown-item"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>

          <Link href="/shop" className="nav-cta">
            <ShoppingBag size={14} strokeWidth={2.2} />
            Buy Online
          </Link>
        </nav>

        {/* Mobile — shop icon + hamburger */}
        <div className="lg:hidden flex items-center gap-3">

          {/* Shop icon button with tooltip */}
          <div className="relative">
            <Link
              href="/shop"
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ backgroundColor: "#4C1D95" }}
              aria-label="Shop at Bioshield"
            >
              <ShoppingBag size={16} strokeWidth={2.2} className="text-white" />
            </Link>

            {/* Tooltip — shows on first load, auto-hides after 3s */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -4, scale: 0.92 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none z-50"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {/* Tooltip body */}
                  <div
                    className="px-3 py-[6px] rounded-lg text-[11px] font-semibold text-white shadow-lg"
                    style={{ backgroundColor: "#4C1D95" }}
                  >
                    Shop at Bioshield
                  </div>
                  {/* Arrow pointing up */}
                  <div
                    className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft:   "5px solid transparent",
                      borderRight:  "5px solid transparent",
                      borderBottom: "6px solid #4C1D95",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hamburger */}
          <Sheet>
            <SheetTrigger
              className="p-2 rounded-md text-gray-700"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 bg-white">
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}

function MobileNav() {
  const [openMobile, setOpenMobile] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-6 py-5 flex items-center"
        style={{ borderBottom: "1px solid var(--nav-border)" }}
      >
        <Image
          src="/Logo-01.png"
          alt="Bioshield Healthcare"
          width={160}
          height={52}
          className="h-[48px] w-auto object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navLinks.map((link) => (
          <div key={link.label}>
            <div
              className="flex items-center justify-between px-3 py-3 rounded-md cursor-pointer"
              onClick={() =>
                link.dropdown &&
                setOpenMobile(openMobile === link.label ? null : link.label)
              }
            >
              {link.dropdown ? (
                <>
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-700">
                    {link.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-gray-500 transition-transform duration-200"
                    style={{
                      transform:
                        openMobile === link.label
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                </>
              ) : (
                <Link
                  href={link.href}
                  className="text-[13px] font-semibold uppercase tracking-wide text-gray-700 w-full"
                >
                  {link.label}
                </Link>
              )}
            </div>

            {link.dropdown && openMobile === link.label && (
              <div className="nav-mobile-sub">
                {link.dropdown.map((item) => (
                  <Link key={item.label} href={item.href} className="nav-mobile-link">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <Link href="/shop" className="nav-mobile-cta">
          <ShoppingBag size={15} strokeWidth={2.2} />
          Buy Online
        </Link>
      </nav>
    </div>
  );
}
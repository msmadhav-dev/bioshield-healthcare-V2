"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import AuthModal, { type AuthUser } from "@/components/shop/AuthModal";
import { useLikedProducts } from "@/lib/useLikedProducts";

type Category = { id: string; name: string };

const SEARCH_WORDS = ["Medicine", "Pharmacy", "Supplements"];

function SvgIcon({
  src,
  alt = "",
  size,
  className = "",
}: {
  src: string;
  alt?: string;
  size: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/* Icon rendered as a CSS mask so its fill color can be controlled and
   transitioned on hover (black -> shop primary green), regardless of the
   source SVG's own fill/stroke colors. */
function HoverIcon({
  src,
  alt = "",
  size,
  className = "",
}: {
  src: string;
  alt?: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-block flex-shrink-0 bg-black transition-colors duration-200 group-hover:bg-[var(--shop-primary-green)] ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/* Typewriter-style animated placeholder: types each word out, pauses,
   deletes it, then moves to the next word in SEARCH_WORDS. */
function AnimatedSearchPlaceholder() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = SEARCH_WORDS[wordIndex];

    let delay = deleting ? 45 : 90;
    if (!deleting && charCount === currentWord.length) delay = 1300;
    if (deleting && charCount === 0) delay = 300;

    const t = setTimeout(() => {
      if (!deleting) {
        if (charCount < currentWord.length) setCharCount((c) => c + 1);
        else setDeleting(true);
      } else {
        if (charCount > 0) setCharCount((c) => c - 1);
        else {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % SEARCH_WORDS.length);
        }
      }
    }, delay);

    return () => clearTimeout(t);
  }, [charCount, deleting, wordIndex]);

  const currentWord = SEARCH_WORDS[wordIndex];

  return (
    <span className="flex items-center text-[13.5px]" style={{ color: "var(--shop-text-secondary)" }}>
      Search&nbsp;
      <span className="whitespace-nowrap">
        {currentWord.slice(0, charCount)}
        <span
          className="ml-[1px] inline-block w-[1px] animate-pulse align-middle"
          style={{ height: "14px", backgroundColor: "var(--shop-text-secondary)" }}
        />
      </span>
    </span>
  );
}

function CategoryDropdown({ compact = false }: { compact?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d.categories) ? d.categories : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative h-full flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-full items-center gap-2 whitespace-nowrap pl-4 pr-3 text-[13px] font-semibold outline-none"
        style={{ color: "var(--shop-text-primary)" }}
      >
        <span className={compact ? "max-w-[104px] truncate" : ""}>
          {selected ? selected.name : "All Categories"}
        </span>
        <SvgIcon src="/icons/chevron-down.svg" size={12} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-10 mt-2 overflow-hidden py-1.5"
          style={{
            minWidth: "180px",
            backgroundColor: "var(--shop-bg)",
            border: "1px solid var(--shop-border)",
            borderRadius: "8px",
            boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-[13px] font-medium transition-colors"
            style={{ color: !selected ? "var(--shop-primary-green)" : "var(--shop-text-primary)" }}
          >
            All Categories
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelected(c);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[var(--shop-light-green)]"
              style={{ color: selected?.id === c.id ? "var(--shop-primary-green)" : "var(--shop-text-primary)" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");

  return (
    <div
      className="flex w-full items-center overflow-hidden"
      style={{
        border: "1px solid var(--shop-border)",
        borderRadius: "999px",
        backgroundColor: "var(--shop-bg)",
        height: compact ? "38px" : "46px",
      }}
    >
      <CategoryDropdown compact={compact} />

      <div className="h-5 w-px flex-shrink-0" style={{ backgroundColor: "var(--shop-border)" }} />

      <div className="relative flex h-full flex-1 items-center px-4">
        {!query && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <AnimatedSearchPlaceholder />
          </div>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="relative z-10 h-full w-full bg-transparent text-[13.5px] outline-none"
          style={{ color: "var(--shop-text-primary)" }}
        />
      </div>

      <button
        type="button"
        className="mr-1.5 flex flex-shrink-0 items-center justify-center rounded-full"
        style={{
          width: compact ? "30px" : "38px",
          height: compact ? "30px" : "38px",
          backgroundColor: "var(--shop-primary-green)",
        }}
        aria-label="Search"
      >
        <SvgIcon src="/icons/search.svg" size={compact ? 14 : 16} className="brightness-0 invert" />
      </button>
    </div>
  );
}

/* Small orange presence-dot shown on cart/liked icons when there's
   something in them — no count, just an indicator. */
function NotificationDot({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      className="absolute -right-0.5 -top-0.5 block h-[10px] w-[10px] rounded-full"
      style={{ backgroundColor: "var(--shop-accent-amber)", border: "2px solid var(--shop-bg)" }}
    />
  );
}

function LocationButton({ city, compact = false }: { city?: string | null; compact?: boolean }) {
  if (compact) {
    return (
      <button type="button" className="group flex min-w-0 items-center gap-1.5 text-[13px] font-semibold outline-none">
        <HoverIcon src="/icons/location.svg" alt="Location" size={16} />
        <span className="whitespace-nowrap" style={{ color: "var(--shop-text-secondary)" }}>
          Deliver to
        </span>
        <span className="min-w-0 truncate" style={{ color: "var(--shop-primary-green)" }}>
          {city || "Chennai"}
        </span>
      </button>
    );
  }

  return (
    <button type="button" className="group flex flex-shrink-0 items-center gap-2.5 outline-none">
      <HoverIcon src="/icons/location.svg" alt="Location" size={24} />
      <div className="text-left">
        <p className="mb-1 text-[13px] font-semibold leading-none" style={{ color: "var(--shop-text-secondary)" }}>
          Deliver to
        </p>
        <p className="text-[16px] font-bold leading-none" style={{ color: "var(--shop-primary-green)" }}>
          {city || "Chennai"}
        </p>
      </div>
    </button>
  );
}

export default function ShopNavbar({ cartCount = 0 }: { cartCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAccountPage =
    pathname === "/shop/account" || pathname?.startsWith("/shop/account/") || pathname === "/shop/cart";

  const [authOpen, setAuthOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<AuthUser | null>(null);
  const { likedIds } = useLikedProducts();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setLoggedInUser(d.user);
      })
      .catch(() => {});
  }, []);

  const handleProfileClick = () => {
    if (loggedInUser) router.push("/shop/account");
    else setAuthOpen(true);
  };

  return (
    <>
      {/* ── Desktop ── */}
      <header
        className="fixed left-0 right-0 top-0 z-50 hidden h-[80px] w-full items-center px-8 md:flex"
        style={{ backgroundColor: "var(--shop-bg)", borderBottom: "1px solid var(--shop-border)" }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-10">
          <Link href="/shop" className="flex-shrink-0">
            <Image
              src="/Logo-01.png"
              alt="Bioshield"
              width={150}
              height={45}
              priority
              className="h-auto w-[180px] object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>
          <LocationButton city={loggedInUser?.city} />
        </div>

        <div className="flex flex-[1.75] items-center justify-center gap-7 px-8">
          <Link href="/shop" aria-label="Home" className="group">
            <HoverIcon src="/icons/home.svg" alt="Home" size={22} />
          </Link>

          <div className="w-full min-w-[360px] max-w-[560px]">
            <CategorySearchBar />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-7">
          <button
            type="button"
            onClick={handleProfileClick}
            aria-label="Account"
            className="group flex items-center gap-2 outline-none"
          >
            <HoverIcon src="/icons/user.svg" alt="Account" size={24} />
            <span className="whitespace-nowrap text-[14px]" style={{ color: "var(--shop-text-primary)" }}>
              Hello, <span className="font-semibold">{loggedInUser ? loggedInUser.name : "Log in"}</span>
            </span>
          </button>

          <Link href="/shop/cart" className="group relative" aria-label="Cart">
            <HoverIcon src="/icons/cart.svg" alt="Cart" size={26} />
            <NotificationDot show={cartCount > 0} />
          </Link>

          <Link href="/shop/account/liked" className="group relative" aria-label="Liked products">
            <HoverIcon src="/icons/heart.svg" alt="Liked products" size={24} />
            <NotificationDot show={likedIds.size > 0} />
          </Link>
        </div>
      </header>

      {/* ── Mobile (same layout/order as before, updated icon styling) ── */}
      <div
        className="fixed left-0 right-0 top-0 z-50 md:hidden"
        style={{ backgroundColor: "var(--shop-bg)", borderBottom: "1px solid var(--shop-border)" }}
      >
        <div className="flex h-[56px] items-center justify-between px-4">
          <Link href="/shop">
            <Image
              src="/Logo-01.png"
              alt="Bioshield"
              width={120}
              height={36}
              priority
              className="h-[100px] w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="Account"
              className="group flex items-center gap-1.5 outline-none"
            >
              <HoverIcon src="/icons/user.svg" alt="Account" size={20} />
              <div className="text-left leading-tight">
                <p className="text-[9.5px] font-medium" style={{ color: "var(--shop-text-secondary)" }}>
                  Hello
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "var(--shop-text-primary)" }}>
                  {loggedInUser ? loggedInUser.name : "Log in"}
                </p>
              </div>
            </button>

            <Link href="/shop/cart" className="group relative" aria-label="Cart">
              <HoverIcon src="/icons/cart.svg" alt="Cart" size={24} />
              <NotificationDot show={cartCount > 0} />
            </Link>
          </div>
        </div>

        {!isAccountPage && (
          <div
            className="flex h-[34px] items-center justify-between px-4"
            style={{ borderTop: "1px solid var(--shop-border)" }}
          >
            <LocationButton city={loggedInUser?.city} compact />

            <Link href="/shop/account/liked" className="group relative" aria-label="Liked products">
              <HoverIcon src="/icons/heart.svg" alt="Liked products" size={20} />
              <NotificationDot show={likedIds.size > 0} />
            </Link>
          </div>
        )}

        {!isAccountPage && (
          <div className="px-4 py-2.5">
            <CategorySearchBar compact />
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={(user) => setLoggedInUser(user)} />
    </>
  );
}
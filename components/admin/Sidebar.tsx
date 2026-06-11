"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Eye,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ── Nav structure ─────────────────────────────────────────────
const mainItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
];

const prescriptionItems = [
  {
    label: "Product Cards",
    icon:  ClipboardList,
    sub: [
      { label: "View Product Cards",    href: "/admin/productcards",     icon: Eye        },
      { label: "Add / Remove Cards",    href: "/admin/productcards/add", icon: PlusCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>(["Product Cards"]);

  const toggle = (label: string) =>
    setOpen((p) =>
      p.includes(label) ? p.filter((l) => l !== label) : [...p, label]
    );

  return (
    <aside
      className="w-[230px] min-h-screen flex-shrink-0 flex flex-col"
      style={{ backgroundColor: "#fff", borderRight: "1px solid #E5E7EB" }}
    >
      {/* Logo */}
      <div
        className="px-5 flex items-center"
        style={{
          borderBottom: "1px solid #E5E7EB",
          height:    "70px",
          minHeight: "70px",
          flexShrink: 0,
        }}
      >
        <Link href="/admin">
          <Image
            src="/Logo-01.png"
            alt="Bioshield"
            width={200}
            height={60}
            className="w-auto object-contain"
            style={{
              mixBlendMode: "multiply",
              height:    "120px",
              maxHeight: "120px",
            }}
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">

        {/* Main */}
        {mainItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-[10px] rounded-lg mb-1 text-[13px] font-medium transition-all duration-150"
              style={{
                backgroundColor: active ? "#4C1D95" : "transparent",
                color:           active ? "#fff"    : "#374151",
              }}
            >
              <item.icon size={16} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}

        {/* ── Prescription section ── */}
        <div className="mt-6 mb-2 px-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            Prescription
          </span>
        </div>

        {prescriptionItems.map((item) => {
          const isOpen    = open.includes(item.label);
          const anyActive = item.sub.some((s) => pathname === s.href);

          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className="w-full flex items-center gap-3 px-3 py-[10px] rounded-lg mb-1 text-[13px] font-medium transition-all duration-150 text-left cursor-pointer"
                style={{ color: anyActive ? "#4C1D95" : "#374151" }}
              >
                <item.icon size={16} strokeWidth={2} />
                <span className="flex-1">{item.label}</span>
                {isOpen
                  ? <ChevronDown  size={13} />
                  : <ChevronRight size={13} />}
              </button>

              {isOpen && (
                <div
                  className="ml-8 mb-2 border-l-2 pl-3"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  {item.sub.map((sub) => {
                    const active = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="flex items-center gap-2 px-2 py-2 text-[12.5px] rounded-md mb-0.5 transition-colors duration-150"
                        style={{
                          color:           active ? "#4C1D95"  : "#6B7280",
                          fontWeight:      active ? 600        : 400,
                          backgroundColor: active ? "#F5F3FF"  : "transparent",
                        }}
                      >
                        <sub.icon size={13} strokeWidth={2} />
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Online Store (coming soon) ── */}
        <div className="mt-6 mb-2 px-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            Online Store
          </span>
        </div>
        <div className="px-3 py-2">
          <p className="text-[11.5px] text-gray-400 italic">
            Coming soon
          </p>
        </div>

      </nav>
    </aside>
  );
}
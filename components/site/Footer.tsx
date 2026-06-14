import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

// ── Instagram SVG ─────────────────────────────────────────────
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

// ── WhatsApp SVG ──────────────────────────────────────────────
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ── Nav links (same as navbar) ────────────────────────────────
const footerLinks = [
  { label: "Home",       href: "/"         },
  { label: "About Us",   href: "/#about"   },
  { label: "Products",   href: "/products" },
  { label: "Contact Us", href: "/#contact" },
];

// ── Addresses ─────────────────────────────────────────────────
const addresses = [
  {
    title: "Admin Office",
    line1: "No.3/5, Neelaganda Nayanar Street,",
    line2: "Kondithope, Chennai – 600 079",
  },
  {
    title: "Regional Office",
    line1: "No.4/37H, Sri Ram Complex,",
    line2: "Eathamozhi Main Road, Nagercoil,",
    line3: "Kanyakumari – 629 501",
  },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#FAFAFA", borderTop: "1px solid #E5E7EB" }}>

      {/* ── Main footer row ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

        {/* ── LEFT — Logo + social + phone ── */}
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mb-[-20px]">
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

          {/* Tagline */}
          <p className="text-gray-500 text-[13px] leading-relaxed max-w-[220px]">
            Healthcare & Medicine Manufacturing — trusted by doctors across India.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-brand-purple transition-colors duration-200"
              aria-label="Instagram"
            >
              <InstagramIcon size={20} />
            </a>

            {/* Mail */}
            <a
              href="mailto:info@bioshieldhealthcare.in"
              className="text-gray-400 hover:text-brand-purple transition-colors duration-200"
              aria-label="Email"
            >
              <Mail size={20} strokeWidth={1.8} />
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919444626144"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-600 transition-colors duration-200"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
          </div>

          {/* Phone */}
          <a
            href="tel:+919444626144"
            className="flex items-center gap-2 group w-fit"
          >
            <Phone size={15} strokeWidth={2} style={{ color: "#4C1D95" }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                Call Us Now
              </p>
              <p
                className="text-[14px] font-semibold group-hover:underline transition-all"
                style={{ color: "#4C1D95" }}
              >
                +91 94446 26144
              </p>
            </div>
          </a>
        </div>

        {/* ── CENTER — Nav links ── */}
        <div className="flex flex-col gap-5">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#166534" }}
          >
            Quick Links
          </h4>
          <ul className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13.5px] text-gray-600 hover:text-brand-purple-deep transition-colors duration-150 font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT — Addresses ── */}
        <div className="flex flex-col gap-7">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "#166534" }}
          >
            Our Offices
          </h4>
          {addresses.map((addr) => (
            <div key={addr.title} className="flex gap-3 items-start">
              <MapPin
                size={16}
                strokeWidth={2}
                className="flex-shrink-0 mt-[2px]"
                style={{ color: "#4C1D95" }}
              />
              <div>
                <p className="text-[14px] font-bold text-gray-800 mb-1">
                  {addr.title}
                </p>
                <p className="text-[14px] text-gray-500 leading-[1.8]">
                  {addr.line1}<br />
                  {addr.line2}<br />
                  {addr.line3 && addr.line3}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop: "1px solid #E5E7EB" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <p className="text-[12px] text-gray-400">
            © {new Date().getFullYear()} Bioshield Healthcare Pvt Ltd. All rights reserved.
          </p>

          {/* Legal links */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {[
              { label: "Privacy Policy",    href: "/privacy-policy"    },
              { label: "Terms & Conditions", href: "/terms"             },
              { label: "Disclaimer",         href: "/disclaimer"        },
            ].map((item, i, arr) => (
              <span key={item.href} className="flex items-center">
                <Link
                  href={item.href}
                  className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 mx-2 text-[11px]">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle, Mail } from "lucide-react";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ContactSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSuccess(true);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative w-full flex items-stretch overflow-hidden"
    >
      {/* ── Background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/contact_us_bg.jpg')" }}
      />

      {/* ── Dark overlay — makes text readable, no blur ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(10,6,30,0.82) 0%, rgba(20,10,50,0.75) 50%, rgba(10,6,30,0.65) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col lg:grid lg:grid-cols-2 gap-12 items-start lg:items-center">

        {/* ── LEFT — Form card ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl p-8 md:p-10 w-full shadow-2xl"
        >
          <div className="mb-7">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#166534" }}>
              Get in Touch
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900 leading-tight">
              Contact <span style={{ color: "#4C1D95" }}>Bioshield</span>
            </h2>
            <p className="text-gray-500 text-[13.5px] mt-2 leading-relaxed">
              Have a query about our products or want to partner with us? We&apos;d love to hear from you.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <CheckCircle size={40} style={{ color: "#166534" }} strokeWidth={1.5} />
              <p className="text-gray-700 font-semibold text-[15px] text-center">Message sent successfully!</p>
              <p className="text-gray-400 text-[13px] text-center">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 rounded-xl"
                  style={{ backgroundColor: "#F4F4F5", border: "1.5px solid transparent" }}
                  onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
                  onBlur={(e)  => (e.target.style.borderColor = "transparent")}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="Enter your email address..."
                  className="w-full px-4 py-3 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 rounded-xl"
                  style={{ backgroundColor: "#F4F4F5", border: "1.5px solid transparent" }}
                  onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
                  onBlur={(e)  => (e.target.style.borderColor = "transparent")}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                  How can we help you? <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  rows={4} placeholder="Enter your message..."
                  className="w-full px-4 py-3 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 rounded-xl resize-none"
                  style={{ backgroundColor: "#F4F4F5", border: "1.5px solid transparent" }}
                  onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
                  onBlur={(e)  => (e.target.style.borderColor = "transparent")}
                />
              </div>

              {error && <p className="text-[12.5px] text-red-500">{error}</p>}

              <div className="flex justify-end pt-1">
                <button
                  type="submit" disabled={submitting}
                  className="group flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold text-white transition-all duration-200 hover:gap-3"
                  style={{ backgroundColor: submitting ? "#6B7280" : "#4C1D95", cursor: submitting ? "not-allowed" : "pointer" }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#3b1572"; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#4C1D95"; }}
                >
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  ) : (
                    <>Send Message <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* ── RIGHT — visible on both mobile and desktop ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="flex flex-col justify-center w-full"
        >
          <span
            className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3"
            style={{ color: "#22C55E" }}
          >
            Reach Out to Us
          </span>
          <h2
            className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
          >
            We&apos;re Here to{" "}
            <span style={{ color: "#A78BFA" }}>Help You</span>
          </h2>
          <p className="text-white/75 text-[14px] md:text-[15px] leading-relaxed max-w-sm mb-10">
            Whether you&apos;re a doctor, pharmacist, or distributor — connect with Bioshield Healthcare
            for product information, partnerships, or any queries.
          </p>

          {/* Contact links — icon only, no pill */}
          <div className="flex flex-col gap-6">

            {/* Email */}
            <a href="mailto:info@bioshieldhealthcare.in" className="flex items-center gap-4 group w-fit">
              <Mail size={22} className="text-white flex-shrink-0 group-hover:text-purple-300 transition-colors" strokeWidth={1.8} />
              <div>
                <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
                  Email Us
                </p>
                <p className="text-white text-[14px] font-medium group-hover:text-purple-200 transition-colors">
                  info@bioshieldhealthcare.in
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/919444626144" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group w-fit">
              <span className="text-white flex-shrink-0 group-hover:text-green-300 transition-colors">
                <WhatsAppIcon size={22} />
              </span>
              <div>
                <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
                  WhatsApp
                </p>
                <p className="text-white text-[14px] font-medium group-hover:text-green-300 transition-colors">
                  Message Now
                </p>
              </div>
            </a>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
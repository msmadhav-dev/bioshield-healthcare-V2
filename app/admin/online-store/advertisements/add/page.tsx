"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  { label: "Mint Green",  value: "#D1FAE5", dark: false },
  { label: "Cyan",        value: "#CFFAFE", dark: false },
  { label: "Dark Navy",   value: "#1E3A8A", dark: true  },
  { label: "Lavender",    value: "#EDE9FE", dark: false },
  { label: "Soft Purple", value: "#F3E8FF", dark: false },
  { label: "Peach",       value: "#FEF3C7", dark: false },
];

export default function AddAdvertisement() {
  const router       = useRouter();
  const inputRef     = useRef<HTMLInputElement>(null);
  const imageUrlRef  = useRef<string | null>(null);

  const [badge,        setBadge]       = useState("");
  const [topCaption,   setTopCaption]  = useState("");
  const [heading,      setHeading]     = useState("");
  const [productName,  setProductName] = useState("");
  const [bgColor,      setBgColor]     = useState("#D1FAE5");
  const [textLight,    setTextLight]   = useState(false);
  const [size,         setSize]        = useState<"main" | "small">("small");
  const [preview,      setPreview]     = useState<string | null>(null);
  const [uploading,    setUploading]   = useState(false);
  const [uploaded,     setUploaded]    = useState(false);
  const [submitting,   setSubmitting]  = useState(false);
  const [success,      setSuccess]     = useState(false);
  const [error,        setError]       = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploaded(false);
    setError("");
    setPreview(URL.createObjectURL(file));
    imageUrlRef.current = null;

    const form = new FormData();
    form.append("file", file);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        imageUrlRef.current = data.url;
        setUploaded(true);
      } else {
        setError("Image upload failed — please try again.");
        setPreview(null);
      }
    } catch {
      setError("Upload error — please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setUploaded(false);
    imageUrlRef.current = null;
  };

  const handleSubmit = async () => {
    if (!heading.trim())     { setError("Heading is required.");       return; }
    if (!productName.trim()) { setError("Product name is required.");  return; }
    if (uploading)           { setError("Wait for upload to finish."); return; }
    if (!imageUrlRef.current){ setError("Product image is required."); return; }

    setError("");
    setSubmitting(true);

    try {
      const res  = await fetch("/api/advertisements", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badge:       badge       || null,
          topCaption:  topCaption  || null,
          heading:     heading.trim(),
          productName: productName.trim(),
          image:       imageUrlRef.current,
          bgColor,
          textLight,
          size,
        }),
      });
      const data = await res.json();
      if (data.ad) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/online-store/advertisements"), 1400);
      } else {
        setError(data.error || "Failed to create banner.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls   = "w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400";
  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };
  const onFocus    = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#4C1D95");
  const onBlur     = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#D1D5DB");

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Advertisement Banner</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a banner with a product image and text.</p>
      </div>

      <div className="bg-white p-6 md:p-8" style={{ border: "1px solid #E5E7EB" }}>

        {/* ── Live Preview ── */}
        <div
          className="relative w-full overflow-hidden mb-8"
          style={{ backgroundColor: bgColor, borderRadius: "14px", minHeight: "160px" }}
        >
          {badge && (
            <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded text-white z-10" style={{ backgroundColor: "#EF4444" }}>
              {badge}
            </span>
          )}
          <div className="p-5 pt-9 pr-40">
            {topCaption && (
              <p className="text-[12px] mb-1" style={{ color: textLight ? "rgba(255,255,255,0.65)" : "#6B7280" }}>
                {topCaption}
              </p>
            )}
            <p className="text-[17px] font-bold leading-tight mb-3" style={{ color: textLight ? "#FFFFFF" : "#111827" }}>
              {heading || "Your heading here"}
            </p>
            <button type="button" className="px-4 py-1.5 rounded-full text-white text-[12px] font-semibold"
              style={{ backgroundColor: textLight ? "rgba(255,255,255,0.2)" : "#166534" }}>
              Shop Now →
            </button>
          </div>

          {/* Preview image — large, bottom right */}
          {preview ? (
            <div className="absolute bottom-0 right-3" style={{ width: "130px", height: "130px" }}>
              <img src={preview} alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
          ) : (
            <div className="absolute bottom-3 right-3 flex items-center justify-center"
              style={{ width: "130px", height: "130px", border: "2px dashed rgba(0,0,0,0.12)", borderRadius: "8px" }}>
              <p className="text-[9px] text-center text-gray-400 px-2">product image<br />here</p>
            </div>
          )}
        </div>

        {/* ── Size ── */}
        <div className="mb-5">
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">Banner Size</label>
          <div className="flex gap-3">
            {(["main", "small"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSize(s)}
                className="flex-1 py-2 text-[13px] font-semibold rounded-lg border-2 transition-all"
                style={{
                  borderColor:     size === s ? "#4C1D95" : "#E5E7EB",
                  backgroundColor: size === s ? "#F5F3FF" : "transparent",
                  color:           size === s ? "#4C1D95" : "#6B7280",
                }}>
                {s === "main" ? "Main (Large Left)" : "Small (Right Column)"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Only 1 main banner. Up to 3 small banners on the right.</p>
        </div>

        {/* ── Badge + Caption ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Badge Text <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. 20% Offer" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Top Caption <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={topCaption} onChange={(e) => setTopCaption(e.target.value)} placeholder="e.g. Available on special discount" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {/* ── Heading + Product name ── */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Heading <span className="text-red-500">*</span></label>
            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="e.g. Ketolol-DT 10 mg" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. ketolol" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            <p className="text-[10px] text-gray-400 mt-1">URL: /shop/products/product-name</p>
          </div>
        </div>

        {/* ── Background color ── */}
        <div className="mb-5">
          <label className="block text-[12px] font-semibold text-gray-700 mb-2">Background Color</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_COLORS.map((c) => (
              <button key={c.value} type="button"
                onClick={() => { setBgColor(c.value); setTextLight(c.dark); }}
                className="w-8 h-8 rounded-lg border-2 transition-all"
                style={{ backgroundColor: c.value, borderColor: bgColor === c.value ? "#4C1D95" : "#E5E7EB" }}
                title={c.label} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} placeholder="#D1FAE5"
              className="px-3 py-2 text-[13px] outline-none rounded-lg w-32" style={{ border: "1px solid #D1D5DB" }} />
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-600">
              <input type="checkbox" checked={textLight} onChange={(e) => setTextLight(e.target.checked)} className="w-4 h-4 accent-purple-700" />
              Light text (for dark backgrounds)
            </label>
          </div>
        </div>

        {/* ── Image upload ── */}
        <div className="mb-7">
          <label className="block text-[12px] font-semibold text-gray-700 mb-2">
            Product Image <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(transparent PNG works best)</span>
          </label>

          <div className="flex items-start gap-4">
            {/* Upload box — larger */}
            <div
              onClick={() => !preview && !uploading && inputRef.current?.click()}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width:           "180px",
                height:          "180px",
                border:          preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
                cursor:          preview ? "default" : "pointer",
                backgroundColor: "#FAFAFA",
                borderRadius:    "10px",
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview"
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px", display: "block" }} />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                      <Loader2 size={24} className="animate-spin" style={{ color: "#4C1D95" }} />
                    </div>
                  )}
                  {!uploading && (
                    <button onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                      <X size={14} className="text-white" />
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Upload size={26} className="text-gray-400" strokeWidth={1.5} />
                  <p className="text-[11px] text-gray-400 text-center px-3">Click to upload</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2 pt-2">
              {uploading && (
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Loader2 size={13} className="animate-spin" /> Uploading to cloud...
                </div>
              )}
              {uploaded && !uploading && (
                <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#166534" }}>
                  <CheckCircle size={13} /> Image uploaded successfully
                </div>
              )}
              {!preview && (
                <p className="text-[11.5px] text-gray-400 leading-relaxed max-w-[160px]">
                  Upload a transparent PNG of the medicine or product for best results.
                </p>
              )}
            </div>
          </div>

          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
        </div>

        {error && <p className="text-[13px] text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || success || uploading}
          className="flex items-center gap-2 px-7 py-3 text-[13px] font-semibold text-white transition-all"
          style={{
            backgroundColor: success ? "#166534" : uploading ? "#9CA3AF" : "#4C1D95",
            cursor:          (submitting || success || uploading) ? "not-allowed" : "pointer",
          }}
        >
          {success ? (
            <><CheckCircle size={15} /> Added!</>
          ) : submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Adding...</>
          ) : uploading ? (
            <><Loader2 size={15} className="animate-spin" /> Uploading...</>
          ) : (
            "Add Banner"
          )}
        </button>
      </div>
    </div>
  );
}
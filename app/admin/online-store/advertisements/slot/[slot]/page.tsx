"use client";

import { useState, useRef, useEffect, use } from "react";
import { Upload, X, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SLOT_CONFIG: Record<number, { bg: string; textLight: boolean; label: string; hasImage: boolean }> = {
  1: { bg: "#D1FAE5", textLight: false, label: "Main Banner (Large Left)",  hasImage: true  },
  2: { bg: "#CFFAFE", textLight: false, label: "Top Right Banner",           hasImage: true  },
  3: { bg: "#1E3A8A", textLight: true,  label: "Text Banner (Navy)",         hasImage: false },
  4: { bg: "#F5F0FF", textLight: false, label: "Bottom Right Banner",        hasImage: true  },
};

export default function SlotEditor({ params }: { params: Promise<{ slot: string }> }) {
  const { slot: slotStr } = use(params);
  const slot     = Number(slotStr);
  const cfg      = SLOT_CONFIG[slot];
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<string | null>(null);

  const [existingId,  setExistingId]  = useState<string | null>(null);
  const [badge,       setBadge]       = useState("");
  const [topCaption,  setTopCaption]  = useState("");
  const [heading,     setHeading]     = useState("");
  const [subText,     setSubText]     = useState("");
  const [productName, setProductName] = useState("");
  const [imageSize,   setImageSize]   = useState(100);
  const [preview,     setPreview]     = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploaded,    setUploaded]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Load existing slot data
  useEffect(() => {
    fetch("/api/advertisements")
      .then((r) => r.json())
      .then((d) => {
        const existing = (d.advertisements || []).find((a: { slot: number }) => a.slot === slot);
        if (existing) {
          setExistingId(existing.id);
          setBadge(existing.badge || "");
          setTopCaption(existing.topCaption || "");
          setHeading(existing.heading || "");
          setSubText(existing.subText || "");
          setProductName(existing.productName || "");
          setImageSize(existing.imageSize || 100);
          if (existing.image) {
            setPreview(existing.image);
            imgRef.current = existing.image;
            setUploaded(true);
          }
        }
        setLoadingData(false);
      })
      .catch(() => setLoadingData(false));
  }, [slot]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploaded(false);
    setError("");
    setPreview(URL.createObjectURL(file));
    imgRef.current = null;

    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        imgRef.current = data.url;
        setUploaded(true);
      } else {
        setError("Upload failed."); setPreview(null);
      }
    } catch {
      setError("Upload error."); setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => { setPreview(null); setUploaded(false); imgRef.current = null; };

  const handleSubmit = async () => {
    if (!heading.trim())     { setError("Heading is required.");       return; }
    if (!productName.trim()) { setError("Product name is required.");  return; }
    if (cfg.hasImage && !imgRef.current) { setError("Product image is required."); return; }
    if (uploading)           { setError("Wait for upload to finish."); return; }

    setError(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/advertisements", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot, badge: badge || null, topCaption: topCaption || null,
          heading: heading.trim(), subText: subText || null,
          productName: productName.trim(),
          image:    imgRef.current || null,
          imageSize: Number(imageSize),
        }),
      });
      const data = await res.json();
      if (data.ad) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/online-store/advertisements"), 1400);
      } else { setError(data.error || "Failed to save."); }
    } catch { setError("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  if (!cfg) return <div className="p-8 text-red-500">Invalid slot number.</div>;

  const inputCls   = "w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400";
  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };
  const onFocus    = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#4C1D95");
  const onBlur     = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#D1D5DB");

  const imgWidthPct = Math.min((imageSize / 100) * 42, 60);

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href="/admin/online-store/advertisements" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 mb-6 w-fit">
        <ArrowLeft size={14} /> Back to Advertisements
      </Link>

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cfg.bg, border: "1px solid #E5E7EB" }} />
          <h1 className="text-xl font-bold text-gray-800">
            Edit Slot {slot} — {cfg.label}
          </h1>
        </div>
        <p className="text-sm text-gray-500">{existingId ? "Updating existing banner." : "No content yet — add it below."}</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white p-6 md:p-8" style={{ border: "1px solid #E5E7EB" }}>

          {/* ── Live preview ── */}
          <div className="mb-8 relative overflow-hidden" style={{ backgroundColor: cfg.bg, borderRadius: "12px", minHeight: "140px" }}>
            {badge && (
              <span className="absolute top-3 left-3 z-10 text-[9px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: "#EF4444" }}>
                {badge}
              </span>
            )}
            <div className="p-5 pt-8 flex flex-col justify-end h-full"
              style={{ paddingRight: cfg.hasImage ? `${imgWidthPct + 6}%` : undefined }}>
              {topCaption && <p className="text-[11px] mb-1" style={{ color: cfg.textLight ? "rgba(255,255,255,0.65)" : "#6B7280" }}>{topCaption}</p>}
              <p className="font-bold text-[16px] mb-2 leading-tight" style={{ color: cfg.textLight ? "#FFFFFF" : "#111827" }}>
                {heading || "Heading preview..."}
              </p>
              {subText && <p className="text-[10px] mb-2" style={{ color: cfg.textLight ? "rgba(255,255,255,0.6)" : "#6B7280" }}>{subText}</p>}
              {slot !== 3 && (
                <span className="inline-block px-4 py-1.5 rounded-full text-white text-[11px] font-semibold w-fit"
                  style={{ backgroundColor: slot === 4 ? "#4C1D95" : "#166534" }}>
                  Shop Now →
                </span>
              )}
            </div>
            {preview && cfg.hasImage && (
              <div className="absolute bottom-0 right-0" style={{ width: `${imgWidthPct}%`, height: "100%" }}>
                <img src={preview} alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply", objectPosition: "bottom right" }} />
              </div>
            )}
          </div>

          {/* ── Fields ── */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Badge <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. 20% Offer" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Top Caption <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={topCaption} onChange={(e) => setTopCaption(e.target.value)} placeholder="e.g. Special Discount" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Heading <span className="text-red-500">*</span></label>
              <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
                placeholder={slot === 3 ? "e.g. Free Shipping 40% OFF" : "e.g. Ketolol-DT 10 mg"}
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {slot === 3 && (
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Sub Text <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={subText} onChange={(e) => setSubText(e.target.value)}
                  placeholder="e.g. On orders above ₹499"
                  className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. ketolol (used for URL)" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              <p className="text-[10px] text-gray-400 mt-1">URL: /shop/products/product-name</p>
            </div>

            {/* Image upload — only for slots with images */}
            {cfg.hasImage && (
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-2">
                  Product Image <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">(transparent PNG works best)</span>
                </label>

                <div className="flex items-start gap-4">
                  <div
                    onClick={() => !preview && !uploading && inputRef.current?.click()}
                    className="relative overflow-hidden flex-shrink-0"
                    style={{
                      width: "180px", height: "180px",
                      border: preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
                      cursor: preview ? "default" : "pointer",
                      backgroundColor: "#FAFAFA", borderRadius: "10px",
                    }}
                  >
                    {preview ? (
                      <>
                        <img src={preview} alt="preview"
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "12px", display: "block" }} />
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

                  <div className="flex flex-col gap-3 pt-2">
                    {uploading && <div className="flex items-center gap-2 text-[12px] text-gray-500"><Loader2 size={13} className="animate-spin" /> Uploading...</div>}
                    {uploaded && !uploading && <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#166534" }}><CheckCircle size={13} /> Uploaded</div>}

                    {/* Image size slider */}
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                        Image Size: <span style={{ color: "#4C1D95" }}>{imageSize}%</span>
                      </label>
                      <input
                        type="range" min={60} max={200} step={5}
                        value={imageSize}
                        onChange={(e) => setImageSize(Number(e.target.value))}
                        className="w-full accent-purple-700"
                        style={{ width: "160px" }}
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5" style={{ width: "160px" }}>
                        <span>60% (small)</span>
                        <span>200% (large)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </div>
            )}
          </div>

          {error && <p className="text-[13px] text-red-500 mt-5 mb-2">{error}</p>}

          <button
            onClick={handleSubmit} disabled={submitting || success || uploading}
            className="mt-6 flex items-center gap-2 px-7 py-3 text-[13px] font-semibold text-white transition-all"
            style={{
              backgroundColor: success ? "#166534" : uploading ? "#9CA3AF" : "#4C1D95",
              cursor: (submitting || success || uploading) ? "not-allowed" : "pointer",
            }}
          >
            {success ? <><CheckCircle size={15} /> Saved!</>
              : submitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</>
              : (existingId ? "Update Banner" : "Save Banner")}
          </button>
        </div>
      )}
    </div>
  );
}
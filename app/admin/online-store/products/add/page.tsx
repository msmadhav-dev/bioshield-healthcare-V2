"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, CheckCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const BADGE_COLORS = [
  { value: "red",  label: "Red",  bg: "#FEE2E2", color: "#DC2626" },
  { value: "blue", label: "Blue", bg: "#DBEAFE", color: "#2563EB" },
  { value: "pink", label: "Pink", bg: "#FCE7F3", color: "#DB2777" },
];

function ImageUploader({
  label, required, preview, uploading, uploaded, onChange, onClear, small = false,
}: {
  label: string; required?: boolean; preview: string | null;
  uploading: boolean; uploaded: boolean;
  onChange: (f: File) => void; onClear: () => void; small?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const size     = small ? "80px" : "150px";

  return (
    <div>
      {label && (
        <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={() => !preview && !uploading && inputRef.current?.click()}
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: size, height: size,
          border: preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
          cursor: preview ? "default" : "pointer",
          backgroundColor: "#FAFAFA", borderRadius: "10px",
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }} />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                <Loader2 size={18} className="animate-spin" style={{ color: "#4C1D95" }} />
              </div>
            )}
            {!uploading && (
              <button onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                <X size={10} className="text-white" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            {uploading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : (
              <><Upload size={16} className="text-gray-400" strokeWidth={1.5} /><p className="text-[9px] text-gray-400">Upload</p></>
            )}
          </div>
        )}
      </div>
      {uploaded && !uploading && !small && (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-semibold">
          <CheckCircle size={10} /> Uploaded
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); e.target.value = ""; }} />
    </div>
  );
}

export default function AddShopProduct() {
  const router        = useRouter();
  const imgRefs       = useRef<{ main: string | null; extra: string[] }>({ main: null, extra: [] });

  const [name,          setName]          = useState("");
  const [price,         setPrice]         = useState("");
  const [offerPrice,    setOfferPrice]    = useState("");
  const [badge,         setBadge]         = useState("");
  const [badgeColor,    setBadgeColor]    = useState("red");
  const [sectionId,     setSectionId]     = useState("");
  const [sectionOrder,  setSectionOrder]  = useState("0");
  const [categoryId,    setCategoryId]    = useState("");
  const [doctorOffer,   setDoctorOffer]   = useState("");
  const [productDetails,setProductDetails]= useState("");
  const [manufacturerDetails,setManufacturerDetails] = useState("");

  const [mainPreview,   setMainPreview]   = useState<string | null>(null);
  const [mainUploading, setMainUploading] = useState(false);
  const [mainUploaded,  setMainUploaded]  = useState(false);

  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [extraUploading,setExtraUploading]= useState(false);

  const [sections,   setSections]   = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    fetch("/api/shop-sections").then((r) => r.json()).then((d) => setSections(d.sections || []));
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    return data.url || null;
  };

  const uploadMain = async (file: File) => {
    setMainUploading(true); setMainUploaded(false);
    setMainPreview(URL.createObjectURL(file));
    imgRefs.current.main = null;
    const url = await uploadFile(file);
    if (url) { imgRefs.current.main = url; setMainUploaded(true); }
    else { setMainPreview(null); setError("Main image upload failed."); }
    setMainUploading(false);
  };

  const uploadExtra = async (file: File) => {
    setExtraUploading(true);
    const localUrl = URL.createObjectURL(file);
    setExtraPreviews((p) => [...p, localUrl]);
    const url = await uploadFile(file);
    if (url) {
      imgRefs.current.extra = [...imgRefs.current.extra, url];
    } else {
      setExtraPreviews((p) => p.filter((u) => u !== localUrl));
      setError("Extra image upload failed.");
    }
    setExtraUploading(false);
  };

  const removeExtra = (i: number) => {
    setExtraPreviews((p) => p.filter((_, idx) => idx !== i));
    imgRefs.current.extra = imgRefs.current.extra.filter((_, idx) => idx !== i);
  };

  const handleSubmit = async () => {
    if (!name.trim())         { setError("Product name required.");   return; }
    if (!offerPrice)          { setError("Offer price required.");    return; }
    if (!imgRefs.current.main){ setError("Main image required.");     return; }
    if (mainUploading || extraUploading) { setError("Wait for uploads."); return; }

    setError(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/shop-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price:               price ? Number(price) : null,
          offerPrice:          Number(offerPrice),
          badge:               badge || null,
          badgeColor,
          mainImage:           imgRefs.current.main,
          images:              imgRefs.current.extra,
          categoryId:          categoryId || null,
          sectionId:           sectionId || null,
          sectionOrder:        Number(sectionOrder) || 0,
          doctorOffer:         doctorOffer || null,
          productDetails:      productDetails || null,
          manufacturerDetails: manufacturerDetails || null,
        }),
      });
      const data = await res.json();
      if (data.product) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/online-store/products"), 1400);
      } else { setError(data.error || "Failed to add."); }
    } catch { setError("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  const inputCls   = "w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400";
  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#4C1D95");
  const blurStyle  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = "#D1D5DB");

  const sectionLabel = (label: string) => (
    <h3 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider mb-4 pb-2"
      style={{ borderBottom: "1px solid #F0F0F5" }}>
      {label}
    </h3>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Shop Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in all details for the product listing and detail page.</p>
      </div>

      <div className="space-y-6">

        {/* Section 1 — Basic Info */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionLabel("1. Product Card Info")}
          <p className="text-[12px] text-gray-400 mb-5">This info shows on the product card in the shop listing.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Azimeez 500mg Tablets" className={inputCls} style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Original Price (M.R.P) <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 250" className={inputCls} style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  Offer Price <span className="text-red-500">*</span>
                </label>
                <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="e.g. 199" className={inputCls} style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Badge Text <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. New, Sale, Hot" className={inputCls} style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Badge Color</label>
                <div className="flex gap-2 pt-1">
                  {BADGE_COLORS.map((c) => (
                    <button key={c.value} type="button"
                      onClick={() => setBadgeColor(c.value)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border-2 transition-all"
                      style={{
                        backgroundColor: badgeColor === c.value ? c.bg : "transparent",
                        borderColor:     badgeColor === c.value ? c.color : "#E5E7EB",
                        color:           c.color,
                      }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main image */}
            <div>
              <ImageUploader
                label="Main Product Image"
                required
                preview={mainPreview}
                uploading={mainUploading}
                uploaded={mainUploaded}
                onChange={uploadMain}
                onClear={() => { setMainPreview(null); setMainUploaded(false); imgRefs.current.main = null; }}
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Detail page images */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionLabel("2. Product Detail Images")}
          <p className="text-[12px] text-gray-400 mb-4">These images show in the product detail page gallery. Main image is always shown first.</p>

          <div className="flex flex-wrap gap-3">
            {extraPreviews.map((src, i) => (
              <div key={i} className="relative" style={{ width: "80px", height: "80px" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4px" }} />
                <button onClick={() => removeExtra(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: "#EF4444" }}>
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}

            {/* Add more button */}
            <ImageUploader
              label=""
              preview={null}
              uploading={extraUploading}
              uploaded={false}
              onChange={uploadExtra}
              onClear={() => {}}
              small
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Click the upload box to add more images.</p>
        </div>

        {/* Section 3 — Category & Section */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionLabel("3. Category & Section")}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 cursor-pointer"
                style={inputStyle} onFocus={focusStyle as never} onBlur={blurStyle as never}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Section (homepage)</label>
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 cursor-pointer"
                style={inputStyle} onFocus={focusStyle as never} onBlur={blurStyle as never}>
                <option value="">— None —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {sectionId && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Order within section (lower = first)</label>
              <input type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)}
                className="w-32 px-3 py-2.5 text-[13px] outline-none text-gray-800"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}
        </div>

        {/* Section 4 — Detail Page Content */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionLabel("4. Product Detail Page Content")}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Doctor&apos;s Exclusive Offer <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={doctorOffer} onChange={(e) => setDoctorOffer(e.target.value)}
                rows={3} placeholder="e.g. Get 20% extra discount on bulk orders. Contact our medical rep for details."
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Product Details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)}
                rows={5} placeholder="Composition, usage instructions, dosage, side effects, storage info..."
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Manufacturer Details <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={manufacturerDetails} onChange={(e) => setManufacturerDetails(e.target.value)}
                rows={3} placeholder="Brand, manufacturer address, country of origin, expiry info..."
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500 px-1">{error}</p>}

        <button
          onClick={handleSubmit} disabled={submitting || success}
          className="w-full flex items-center justify-center gap-2 py-4 text-[14px] font-bold text-white rounded-xl transition-all"
          style={{ backgroundColor: success ? "#166534" : "#4C1D95", cursor: (submitting || success) ? "not-allowed" : "pointer" }}
        >
          {success ? <><CheckCircle size={16} /> Product Added!</>
            : submitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</>
            : "Add Product to Shop"}
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, CheckCircle, Plus, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { convertToGrams } from "@/lib/pricing";

const BADGE_COLORS = [
  { value: "green",  label: "Green",  bg: "#DCFCE7", color: "#15803D" },
  { value: "orange", label: "Orange", bg: "#FEF3C7", color: "#B45309" },
];

const CARD_COLORS = [
  { value: "purple", label: "Purple", swatch: "#EBF0FE" },
  { value: "orange", label: "Orange", swatch: "#FFF1E2" },
];

const PRODUCT_TYPES = [
  { value: "TABLET", label: "Tablet" },
  { value: "GEL",    label: "Gel" },
  { value: "SYRUP",  label: "Syrup" },
  { value: "OTHER",  label: "Others" },
];

type DetailSection = { heading: string; content: string };

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
          width:           size,
          height:          size,
          border:          preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
          cursor:          preview ? "default" : "pointer",
          backgroundColor: "#FAFAFA",
          borderRadius:    "10px",
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt=""
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }} />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
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
            {uploading
              ? <Loader2 size={18} className="animate-spin text-gray-400" />
              : <><Upload size={16} className="text-gray-400" strokeWidth={1.5} /><p className="text-[9px] text-gray-400">Upload</p></>
            }
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
  const router       = useRouter();
  const imgRefs      = useRef<{ main: string | null; extra: string[] }>({ main: null, extra: [] });

  // Product Card Info — name, badge, image ONLY
  const [name,          setName]         = useState("");
  const [badge,         setBadge]        = useState("");
  const [badgeColor,    setBadgeColor]   = useState("green");
  const [cardColor,     setCardColor]    = useState("purple");

  // Pricing — customer & doctor, split
  const [customerMrp,          setCustomerMrp]          = useState("");
  const [customerOfferPercent, setCustomerOfferPercent] = useState("");
  const [doctorMrp,            setDoctorMrp]            = useState("");
  const [doctorPtrPrice,       setDoctorPtrPrice]       = useState("");
  const [taxPercent,           setTaxPercent]           = useState("");

  // Units, stock, product type, weight
  const [unit,          setUnit]         = useState("");
  const [unitInput,      setUnitInput]     = useState("");
  const [availableUnits, setAvailableUnits]= useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [productType,   setProductType]   = useState("OTHER");
  const [weightInGrams, setWeightInGrams] = useState("");
  const [weightUnit,    setWeightUnit]    = useState<"G" | "ML" | "L">("G");

  // Section / category
  const [sectionId,    setSectionId]   = useState("");
  const [sectionOrder, setSectionOrder]= useState("0");
  const [categoryId,   setCategoryId]  = useState("");

  // Detail page content
  const [doctorOffer,          setDoctorOffer]          = useState("");
  const [detailSections,       setDetailSections]       = useState<DetailSection[]>([]);
  const [manufacturerDetails,  setManufacturerDetails]  = useState("");
  const [benefits,             setBenefits]             = useState("");
  const [productDescription,   setProductDescription]   = useState("");

  // Offers
  const [offerInput, setOfferInput] = useState("");
  const [offers,     setOffers]     = useState<string[]>([]);

  // Frequently bought
  const [allProducts,        setAllProducts]        = useState<{ id: string; name: string; mainImage: string }[]>([]);
  const [frequentlyBoughtIds,setFrequentlyBoughtIds]= useState<string[]>([]);
  const [fbSearch,           setFbSearch]            = useState("");

  // Images
  const [mainPreview,   setMainPreview]   = useState<string | null>(null);
  const [mainUploading, setMainUploading] = useState(false);
  const [mainUploaded,  setMainUploaded]  = useState(false);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [extraUploading,setExtraUploading]= useState(false);

  // Data lists
  const [sections,   setSections]   = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    fetch("/api/shop-sections").then((r) => r.json()).then((d) => setSections(d.sections || []));
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
    fetch("/api/shop-products").then((r) => r.json()).then((d) => setAllProducts(d.products || []));
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

  // Unit tag helpers
  const addUnit = () => {
    const val = unitInput.trim();
    if (val && !availableUnits.includes(val)) {
      setAvailableUnits((p) => [...p, val]);
      setUnitInput("");
    }
  };
  const removeUnit = (i: number) => setAvailableUnits((p) => p.filter((_, idx) => idx !== i));

  // Offer helpers
  const addOffer = () => {
    const val = offerInput.trim();
    if (val) { setOffers((p) => [...p, val]); setOfferInput(""); }
  };
  const removeOffer = (i: number) => setOffers((p) => p.filter((_, idx) => idx !== i));

  // Frequently bought toggle
  const toggleFrequentlyBought = (id: string) => {
    setFrequentlyBoughtIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  // Detail section helpers
  const addSection = () => setDetailSections((p) => [...p, { heading: "", content: "" }]);
  const removeSection = (i: number) => setDetailSections((p) => p.filter((_, idx) => idx !== i));
  const updateSection = (i: number, field: keyof DetailSection, val: string) =>
    setDetailSections((p) => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const handleSubmit = async () => {
    if (!name.trim())          { setError("Product name required.");   return; }
    if (!customerMrp)           { setError("Customer M.R.P required."); return; }
    if (!imgRefs.current.main) { setError("Main image required.");     return; }
    if (mainUploading || extraUploading) { setError("Wait for uploads to finish."); return; }
    if (productType !== "TABLET" && !weightInGrams) {
      setError("Weight (grams) is required for delivery calculation, unless the product type is Tablet.");
      return;
    }

    setError(""); setSubmitting(true);
    try {
      const validSections = detailSections.filter((s) => s.heading.trim() || s.content.trim());

      const res  = await fetch("/api/shop-products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
          name:                 name.trim(),
          badge:                badge || null,
          badgeColor,
          cardColor,
          mainImage:            imgRefs.current.main,
          images:               imgRefs.current.extra,
          categoryId:           categoryId || null,
          sectionId:            sectionId || null,
          sectionOrder:         Number(sectionOrder) || 0,
          doctorOffer:          doctorOffer || null,
          productDetailSections: validSections.length > 0 ? validSections : null,
          manufacturerDetails:  manufacturerDetails || null,
          unit:                 unit || null,
          availableUnits,
          stock:                stock ? Number(stock) : null,
          benefits:             benefits || null,
          productDescription:   productDescription || null,
          offers,
          frequentlyBoughtIds,

          customerMrp:          Number(customerMrp),
          customerOfferPercent: customerOfferPercent || null,
          doctorMrp:            doctorMrp || null,
          doctorPtrPrice:       doctorPtrPrice || null,
          taxPercent:           taxPercent || null,

          productType,
          weightInGrams: weightInGrams ? convertToGrams(Number(weightInGrams), weightUnit) : null,
          weightUnit,
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
  const onFocus    = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#4C1D95");
  const onBlur     = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#D1D5DB");

  const sectionHeader = (label: string, sub?: string) => (
    <div className="mb-5 pb-3" style={{ borderBottom: "1px solid #F0F0F5" }}>
      <h3 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider">{label}</h3>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl pb-16">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Shop Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in all sections below for the product listing and detail page.</p>
      </div>

      <div className="space-y-5">

        {/* ── 1. Product Card Info ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("1. Product Card Info", "Name, badge, and image only — shown on shop listing cards")}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Orosoft Plus Gel" className={inputCls} style={inputStyle}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  Badge Text <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. New, Sale" className={inputCls} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur} />
                <p className="text-[11px] text-gray-400 mt-1">Shown on the product card, next to the discount badge.</p>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Badge Color</label>
                <div className="flex gap-2 pt-1">
                  {BADGE_COLORS.map((c) => (
                    <button key={c.value} type="button" onClick={() => setBadgeColor(c.value)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold border-2 transition-all"
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

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Card Background Color</label>
              <p className="text-[11px] text-gray-400 mb-2">Background behind the product image on shop listing cards.</p>
              <div className="flex gap-2">
                {CARD_COLORS.map((c) => (
                  <button key={c.value} type="button" onClick={() => setCardColor(c.value)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border-2 transition-all"
                    style={{
                      borderColor: cardColor === c.value ? "var(--shop-primary-green, #17653A)" : "#E5E7EB",
                      backgroundColor: cardColor === c.value ? "#F0FDF4" : "transparent",
                      color: "#374151",
                    }}>
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.swatch, border: "1px solid #E5E7EB" }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <ImageUploader
              label="Main Product Image" required
              preview={mainPreview} uploading={mainUploading} uploaded={mainUploaded}
              onChange={uploadMain}
              onClear={() => { setMainPreview(null); setMainUploaded(false); imgRefs.current.main = null; }}
            />
          </div>
        </div>

        {/* ── 2. Gallery Images ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("2. Gallery Images", "Shown in product detail page — first image auto-slides every 5s")}
          <div className="flex flex-wrap gap-3">
            {extraPreviews.map((src, i) => (
              <div key={i} className="relative" style={{ width: "80px", height: "80px" }}>
                <img src={src} alt=""
                  style={{ width: "100%", height: "100%", objectFit: "contain", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "4px" }} />
                <button onClick={() => removeExtra(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: "#EF4444" }}>
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            <ImageUploader label="" preview={null} uploading={extraUploading} uploaded={false}
              onChange={uploadExtra} onClear={() => {}} small />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Click the box to add more images. Main image always shows first.</p>
        </div>

        {/* ── 3. Pricing — Customer & Doctor ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("3. Pricing", "Separate pricing for customers and doctors")}

          <div className="grid grid-cols-2 gap-6">
            {/* Customer pricing */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FAFAFA" }}>
              <p className="text-[12px] font-extrabold text-gray-800 mb-3 uppercase tracking-wide">Customer</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    M.R.P <span className="text-red-500">*</span>
                  </label>
                  <input type="number" value={customerMrp} onChange={(e) => setCustomerMrp(e.target.value)}
                    placeholder="e.g. 153" className={inputCls} style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    Offer <span className="text-gray-400 font-normal">(%, optional)</span>
                  </label>
                  <input type="number" value={customerOfferPercent} onChange={(e) => setCustomerOfferPercent(e.target.value)}
                    placeholder="e.g. 10" className={inputCls} style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                    onFocus={onFocus} onBlur={onBlur} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    If left blank, the M.R.P is shown struck-through with the same M.R.P repeated next to it.
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor pricing */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FAFAFA" }}>
              <p className="text-[12px] font-extrabold text-gray-800 mb-3 uppercase tracking-wide">Doctor</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    M.R.P <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="number" value={doctorMrp} onChange={(e) => setDoctorMrp(e.target.value)}
                    placeholder="defaults to customer M.R.P" className={inputCls} style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                    PTR Price <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="number" value={doctorPtrPrice} onChange={(e) => setDoctorPtrPrice(e.target.value)}
                    placeholder="e.g. 95" className={inputCls} style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                    onFocus={onFocus} onBlur={onBlur} />
                  <p className="text-[10px] text-gray-400 mt-1">M.R.P always shows struck-through; PTR is the doctor's actual price.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Tax <span className="text-gray-400 font-normal">(%, optional — doctor orders only)</span>
            </label>
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="e.g. 12" className={inputCls} style={{ ...inputStyle, maxWidth: "160px" }}
              onFocus={onFocus} onBlur={onBlur} />
            <p className="text-[10px] text-gray-400 mt-1">
              Never shown on product cards or pages — only calculated into the order summary total for doctor orders.
            </p>
          </div>
        </div>

        {/* ── 4. Units & Stock ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("4. Units & Stock", "Pack sizes, stock, and delivery weight info")}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Product Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {PRODUCT_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setProductType(t.value)}
                    className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border-2 transition-all"
                    style={{
                      backgroundColor: productType === t.value ? "#F0FDF4" : "transparent",
                      borderColor:     productType === t.value ? "#14532D" : "#E5E7EB",
                      color:           productType === t.value ? "#14532D" : "#6B7280",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Weight <span className="text-gray-400 font-normal">
                  {productType === "TABLET" ? "(not used for tablets)" : "(used for delivery weight calculation)"}
                </span>
              </label>
              <div className="flex gap-2">
                <input type="number" value={weightInGrams} onChange={(e) => setWeightInGrams(e.target.value)}
                  placeholder="e.g. 300" disabled={productType === "TABLET"}
                  className={inputCls} style={{ ...inputStyle, maxWidth: "160px", opacity: productType === "TABLET" ? 0.5 : 1 }}
                  onFocus={onFocus} onBlur={onBlur} />
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as "G" | "ML" | "L")}
                  disabled={productType === "TABLET"}
                  className="px-3 py-2.5 text-[13px] outline-none cursor-pointer"
                  style={{ ...inputStyle, opacity: productType === "TABLET" ? 0.5 : 1 }}>
                  <option value="G">Grams (g)</option>
                  <option value="ML">Millilitres (ml)</option>
                  <option value="L">Litres (L)</option>
                </select>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Litres are automatically converted to grams (1L = 1000g) when saved — the calculation always uses grams.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Display Unit <span className="text-gray-400 font-normal">(shown after product name)</span>
              </label>
              <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 15gm, 100ml, 10 Strips"
                className={inputCls} style={{ ...inputStyle, maxWidth: "280px" }}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Available Pack Sizes
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUnit(); } }}
                  placeholder="e.g. 15gm"
                  className="px-3 py-2 text-[13px] outline-none flex-1"
                  style={{ ...inputStyle, maxWidth: "200px", borderRadius: "6px" }}
                />
                <button type="button" onClick={addUnit}
                  className="px-4 py-2 text-[12px] font-semibold text-white rounded-lg flex items-center gap-1.5"
                  style={{ backgroundColor: "#4C1D95" }}>
                  <Plus size={13} /> Add
                </button>
              </div>
              {availableUnits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableUnits.map((u, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-semibold"
                      style={{ backgroundColor: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                      {u}
                      <button type="button" onClick={() => removeUnit(i)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5">Press Enter or click Add. Users can select their preferred pack size.</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Available Stock <span className="text-gray-400 font-normal">(number of units)</span>
              </label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 150"
                className={inputCls} style={{ ...inputStyle, maxWidth: "200px" }}
                onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </div>

        {/* ── 5. Category & Section ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("5. Category & Section")}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 cursor-pointer"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Homepage Section</label>
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 cursor-pointer"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                <option value="">— None —</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {sectionId && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Order in section (0 = first)
              </label>
              <input type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)}
                className="w-24 px-3 py-2 text-[13px] outline-none" style={inputStyle}
                onFocus={onFocus} onBlur={onBlur} />
            </div>
          )}
        </div>

        {/* ── 6. Product Detail Page Content ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("6. Product Detail Page", "Content shown on the individual product page")}

          <div className="mb-5">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Doctor&apos;s Exclusive Offer <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={doctorOffer} onChange={(e) => setDoctorOffer(e.target.value)}
              rows={2} placeholder="e.g. Get 20% extra discount on bulk orders."
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700">Product Detail Sections</label>
                <p className="text-[10px] text-gray-400 mt-0.5">Add sections like Composition, Indications, Dosage etc.</p>
              </div>
              <button type="button" onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white rounded-lg"
                style={{ backgroundColor: "#4C1D95" }}>
                <Plus size={13} /> Add Section
              </button>
            </div>

            {detailSections.length === 0 && (
              <div className="flex items-center justify-center py-8 rounded-lg"
                style={{ border: "2px dashed #E5E7EB", backgroundColor: "#FAFAFA" }}>
                <p className="text-[12px] text-gray-400">
                  Click &quot;Add Section&quot; to add product detail sections
                </p>
              </div>
            )}

            <div className="space-y-4">
              {detailSections.map((section, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Section {i + 1}
                    </span>
                    <button type="button" onClick={() => removeSection(i)}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => updateSection(i, "heading", e.target.value)}
                      placeholder="Section heading (e.g. Composition, Indications, Dosage)"
                      className="w-full px-3 py-2 text-[13px] font-semibold outline-none text-gray-800"
                      style={{ border: "1px solid #D1D5DB", backgroundColor: "#FFFFFF", borderRadius: "6px" }}
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(i, "content", e.target.value)}
                      placeholder="Section content..."
                      rows={3}
                      className="w-full px-3 py-2 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
                      style={{ border: "1px solid #D1D5DB", backgroundColor: "#FFFFFF", borderRadius: "6px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Manufacturer Details <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={manufacturerDetails} onChange={(e) => setManufacturerDetails(e.target.value)}
              rows={2} placeholder="e.g. Innovative Pharmaceuticals Pvt Ltd, Chennai"
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div className="mb-5">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Benefits <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)}
              rows={3} placeholder="Key benefits of this product, one point per line"
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Product Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)}
              rows={4} placeholder="Longer descriptive text shown below the detail sections"
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400 resize-none"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {/* ── 7. Available Offers ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("7. Available Offers", "Shown only if at least one offer is added")}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={offerInput}
              onChange={(e) => setOfferInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOffer(); } }}
              placeholder="e.g. Flat 10% off on UPI payments"
              className={inputCls}
              style={{ ...inputStyle, maxWidth: "360px" }}
            />
            <button type="button" onClick={addOffer}
              className="px-4 py-2 text-[12px] font-semibold text-white rounded-lg flex items-center gap-1.5 flex-shrink-0"
              style={{ backgroundColor: "#14532D" }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {offers.length > 0 && (
            <div className="flex flex-col gap-2">
              {offers.map((o, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <span className="text-[12.5px] text-gray-700">{o}</span>
                  <button type="button" onClick={() => removeOffer(i)}>
                    <X size={13} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 8. Frequently Bought Together ── */}
        <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
          {sectionHeader("8. Frequently Bought Together", "Select existing products to recommend alongside this one")}

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fbSearch}
              onChange={(e) => setFbSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 text-[13px] outline-none rounded-lg"
              style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
            />
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {allProducts
              .filter((p) => p.name.toLowerCase().includes(fbSearch.toLowerCase()))
              .map((p) => {
                const checked = frequentlyBoughtIds.includes(p.id);
                return (
                  <label key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: checked ? "#F0FDF4" : "#FAFAFA", border: `1px solid ${checked ? "#BBF7D0" : "#F0F0F0"}` }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleFrequentlyBought(p.id)}
                      className="w-4 h-4 flex-shrink-0" style={{ accentColor: "#14532D" }} />
                    <img src={p.mainImage} alt={p.name}
                      className="w-8 h-8 object-contain flex-shrink-0" style={{ mixBlendMode: "multiply" }} />
                    <span className="text-[12.5px] text-gray-700 truncate">{p.name}</span>
                  </label>
                );
              })}
            {allProducts.length === 0 && (
              <p className="text-[12px] text-gray-400 text-center py-4">No other products yet.</p>
            )}
          </div>
          {frequentlyBoughtIds.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-2">{frequentlyBoughtIds.length} product(s) selected</p>
          )}
        </div>

        {error && <p className="text-[13px] text-red-500 px-1">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || success}
          className="w-full flex items-center justify-center gap-2 py-4 text-[14px] font-bold text-white rounded-xl"
          style={{
            backgroundColor: success ? "#166534" : "#4C1D95",
            cursor:          (submitting || success) ? "not-allowed" : "pointer",
          }}
        >
          {success
            ? <><CheckCircle size={16} /> Product Added!</>
            : submitting
              ? <><Loader2 size={16} className="animate-spin" /> Adding...</>
              : "Add Product to Shop"}
        </button>
      </div>
    </div>
  );
}
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle, Loader2, Trash2, Upload, X } from "lucide-react";
import {
  ADVERTISEMENT_THEME_KEYS,
  ADVERTISEMENT_THEME_OPTIONS,
  SLOT_DEFAULT_THEMES,
  type AdvertisementThemeKey,
} from "@/lib/advertisementThemes";
import { Banner, type Ad } from "@/components/shop/AdvertisementBanners";

export type AdvertisementFormValue = {
  slot: number;
  badge: string;
  topCaption: string; // "Category" in the UI
  heading: string;    // "Product Title" in the UI
  productName: string;
  linkUrl: string;
  image: string | null;
  imageSize: number;
  imageSizeMobile: number;
  titleSizeDesktop: number;
  titleSizeMobile: number;
  captionSizeDesktop: number;
  captionSizeMobile: number;
  buttonSizeDesktop: number;
  buttonSizeMobile: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageOffsetXMobile: number;
  imageOffsetYMobile: number;
  theme: AdvertisementThemeKey;
  buttonText: string;
};

const SLOT_HELP: Record<number, string> = {
  1: "Slot 1: Large Horizontal — product image on the left (50%), caption/title/button on the right (50%).",
  2: "Slot 2: Small — caption and title on the left, product image on the right. No button on this slot.",
  3: "Slot 3: Tall — badge, caption, title, and button at the top; a larger product image fills the space below.",
  4: "Slot 4: Small — caption, title, and button on the left, product image on the right.",
  5: "Slot 5: Medium Wide — badge, caption, and title on the left (50%, vertically centered), product image on the right (50%).",
};

function toAd(value: AdvertisementFormValue): Ad {
  return {
    id: "preview",
    slot: value.slot,
    badge: value.badge || null,
    topCaption: value.topCaption || null,
    heading: value.heading || "Preview heading",
    productName: value.productName || "preview-product",
    linkUrl: value.linkUrl || null,
    image: value.image || null,
    imageSize: value.imageSize,
    imageSizeMobile: value.imageSizeMobile,
    titleSizeDesktop: value.titleSizeDesktop,
    titleSizeMobile: value.titleSizeMobile,
    captionSizeDesktop: value.captionSizeDesktop,
    captionSizeMobile: value.captionSizeMobile,
    buttonSizeDesktop: value.buttonSizeDesktop,
    buttonSizeMobile: value.buttonSizeMobile,
    imageOffsetX: value.imageOffsetX,
    imageOffsetY: value.imageOffsetY,
    imageOffsetXMobile: value.imageOffsetXMobile,
    imageOffsetYMobile: value.imageOffsetYMobile,
    theme: value.theme,
    buttonText: value.buttonText || "Buy now",
  };
}

function SizeSlider({
  label, value, onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[12.5px] font-semibold text-gray-700">{label}</label>
        <span className="text-[12px] font-semibold" style={{ color: "#2ECC71" }}>{value}%</span>
      </div>
      <input
        type="range"
        min={50}
        max={250}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "#2ECC71" }}
      />
    </div>
  );
}

export default function AdvertisementForm({
  title,
  submitLabel,
  initialValue,
  lockSlot = false,
  onSubmit,
  onDelete,
}: {
  title: string;
  submitLabel: string;
  initialValue: AdvertisementFormValue;
  lockSlot?: boolean;
  onSubmit: (value: AdvertisementFormValue) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<string | null>(initialValue.image);

  const [value, setValue] = useState<AdvertisementFormValue>(initialValue);
  const [preview, setPreview] = useState<string | null>(initialValue.image);
  const [sizeTab, setSizeTab] = useState<"desktop" | "mobile">("desktop");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const inputCls = "w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none transition-colors";
  const inputStyle = { borderColor: "var(--shop-border)" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#2ECC71");
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "var(--shop-border)");

  async function uploadImage(file: File) {
    setUploading(true);
    setUploaded(false);
    setError("");
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (data.url) {
        imageUrlRef.current = data.url;
        setValue((prev) => ({ ...prev, image: data.url }));
        setUploaded(true);
      } else {
        setError("Image upload failed.");
        setPreview(null);
        imageUrlRef.current = null;
      }
    } catch {
      setError("Image upload failed.");
      setPreview(null);
      imageUrlRef.current = null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!value.heading.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!value.productName.trim()) {
      setError("Product name is required.");
      return;
    }

    if (uploading) {
      setError("Wait for image upload to finish.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSubmit({
        ...value,
        image: imageUrlRef.current ?? value.image,
      });
      setSuccess(true);
    } catch {
      setError("Unable to save advertisement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setError("Unable to delete advertisement.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Badge, category, title, button, and image — every slot uses the same content fields, just arranged differently.
          </p>
        </div>

        {onDelete && (
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] text-gray-500">Delete this banner?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ backgroundColor: "#EF4444" }}
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : null} Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-gray-600"
                style={{ border: "1px solid var(--shop-border)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
              style={{ color: "#EF4444", border: "1px solid #FCA5A5" }}
            >
              <Trash2 size={13} /> Delete
            </button>
          )
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[460px_1fr]">
        <div
          className="bg-white p-6 md:p-8"
          style={{ border: "1px solid var(--shop-border)" }}
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Slot
              </label>
              <select
                value={Number.isFinite(value.slot) ? value.slot : 1}
                disabled={lockSlot}
                onChange={(e) =>
                  setValue((prev) => {
                    const slot = Number(e.target.value);
                    return {
                      ...prev,
                      slot,
                      theme: SLOT_DEFAULT_THEMES[slot],
                    };
                  })
                }
                className={inputCls}
                style={inputStyle}
              >
                <option value={1}>Slot 1 - Large Horizontal</option>
                <option value={2}>Slot 2 - Small</option>
                <option value={3}>Slot 3 - Tall</option>
                <option value={4}>Slot 4 - Small</option>
                <option value={5}>Slot 5 - Medium Wide</option>
              </select>
              <p className="mt-2 text-[12px] text-gray-500">
                {SLOT_HELP[value.slot]}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Card Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ADVERTISEMENT_THEME_KEYS.map((key) => {
                  const item = ADVERTISEMENT_THEME_OPTIONS[key];
                  const active = value.theme === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setValue((prev) => ({ ...prev, theme: key }))
                      }
                      className="rounded-xl p-2 transition-colors"
                      style={{
                        border: active ? "2px solid #2ECC71" : "1px solid var(--shop-border)",
                      }}
                    >
                      <div
                        className="relative mb-2 h-12 overflow-hidden rounded-lg"
                        style={{ backgroundColor: item.background }}
                      >
                        <img
                          src={item.styleImage}
                          alt=""
                          className="absolute bottom-[-10%] right-[-8%] w-[60%] object-contain"
                          style={{ opacity: 0.4 }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11.5px] text-gray-400">
                Each color pairs with its matching decorative blob image — shown faintly behind the content.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Badge <span className="font-normal text-gray-400">(optional — shown in amber-orange, top of card)</span>
              </label>
              <input
                value={value.badge}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, badge: e.target.value }))
                }
                placeholder="Sale"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Category
              </label>
              <input
                value={value.topCaption}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, topCaption: e.target.value }))
                }
                placeholder="Pyridoxine Vitamin B6"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Product Title
              </label>
              <input
                value={value.heading}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, heading: e.target.value }))
                }
                placeholder="Advertisement heading"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Product Name / Route Key
              </label>
              <input
                value={value.productName}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, productName: e.target.value }))
                }
                placeholder="Use the product route value"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <p className="mt-1.5 text-[11.5px] text-gray-400">
                Used to build the link as /shop/products/[this value] — unless a Custom Link below is set.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Custom Link <span className="font-normal text-gray-400">(optional — overrides the product route)</span>
              </label>
              <input
                value={value.linkUrl}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, linkUrl: e.target.value }))
                }
                placeholder="/shop?category=vitamins"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <p className="mt-1.5 text-[11.5px] text-gray-400">
                Point this card anywhere — a category, an offers page, an external URL. Leave blank to use the product route above.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Button Text
              </label>
              <input
                value={value.buttonText}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, buttonText: e.target.value }))
                }
                placeholder="Buy now"
                className={inputCls}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-semibold text-gray-700">
                Product Image
              </label>
              <p className="mb-2 text-[11.5px] text-gray-400">
                Use a transparent PNG or WebP. The image is shown at its original aspect ratio — never cropped or stretched.
              </p>
              <div className="flex items-start gap-4">
                <div
                  onClick={() =>
                    !preview && !uploading && inputRef.current?.click()
                  }
                  className="relative h-[150px] w-[150px] flex-shrink-0 overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: ADVERTISEMENT_THEME_OPTIONS[value.theme].background,
                    border: preview
                      ? "1px solid var(--shop-border)"
                      : "2px dashed #D1D5DB",
                    cursor: preview ? "default" : "pointer",
                  }}
                >
                  <img
                    src={ADVERTISEMENT_THEME_OPTIONS[value.theme].styleImage}
                    alt=""
                    className="absolute bottom-[-10%] right-[-8%] w-[60%] object-contain"
                    style={{ opacity: 0.4 }}
                  />

                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt="preview"
                        fill
                        className="object-contain p-3"
                        sizes="150px"
                        unoptimized
                      />
                      {!uploading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview(null);
                            imageUrlRef.current = null;
                            setValue((prev) => ({ ...prev, image: null }));
                          }}
                          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Upload size={18} className="text-gray-500" />
                      <p className="text-[10px] text-gray-500">
                        Click to upload
                      </p>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  {uploaded && !uploading ? (
                    <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#22C55E" }}>
                      <CheckCircle size={14} />
                      Image uploaded
                    </div>
                  ) : null}
                </div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-[13px] font-semibold text-gray-700">Sizes</label>
                <div className="flex rounded-full p-0.5" style={{ backgroundColor: "#F3F4F6" }}>
                  {(["desktop", "mobile"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSizeTab(tab)}
                      className="rounded-full px-3 py-1 text-[11.5px] font-semibold capitalize transition-colors"
                      style={{
                        backgroundColor: sizeTab === tab ? "#FFFFFF" : "transparent",
                        color: sizeTab === tab ? "#111827" : "#6B7280",
                        boxShadow: sizeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mb-3 text-[11.5px] text-gray-400">
                Set independently for desktop and mobile — the {sizeTab} preview on the right updates live.
              </p>

              <div className="space-y-4 rounded-xl p-4" style={{ border: "1px solid var(--shop-border)" }}>
                {sizeTab === "desktop" ? (
                  <>
                    <SizeSlider label="Image Size" value={value.imageSize}
                      onChange={(v) => setValue((prev) => ({ ...prev, imageSize: v }))} />
                    <SizeSlider label="Text (Title) Size" value={value.titleSizeDesktop}
                      onChange={(v) => setValue((prev) => ({ ...prev, titleSizeDesktop: v }))} />
                    <SizeSlider label="Caption Size" value={value.captionSizeDesktop}
                      onChange={(v) => setValue((prev) => ({ ...prev, captionSizeDesktop: v }))} />
                    <SizeSlider label="Button Size" value={value.buttonSizeDesktop}
                      onChange={(v) => setValue((prev) => ({ ...prev, buttonSizeDesktop: v }))} />
                  </>
                ) : (
                  <>
                    <SizeSlider label="Image Size" value={value.imageSizeMobile}
                      onChange={(v) => setValue((prev) => ({ ...prev, imageSizeMobile: v }))} />
                    <SizeSlider label="Text (Title) Size" value={value.titleSizeMobile}
                      onChange={(v) => setValue((prev) => ({ ...prev, titleSizeMobile: v }))} />
                    <SizeSlider label="Caption Size" value={value.captionSizeMobile}
                      onChange={(v) => setValue((prev) => ({ ...prev, captionSizeMobile: v }))} />
                    <SizeSlider label="Button Size" value={value.buttonSizeMobile}
                      onChange={(v) => setValue((prev) => ({ ...prev, buttonSizeMobile: v }))} />
                  </>
                )}
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-5 text-[13px]" style={{ color: "#EF4444" }}>{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="mt-6 flex items-center gap-2 rounded-full px-6 text-[13px] font-semibold text-white transition-colors"
            style={{ backgroundColor: success ? "#28BE64" : "#2ECC71", height: "44px" }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {success ? "Saved" : submitLabel}
          </button>
        </div>

        <div
          className="bg-white p-6 md:p-8"
          style={{ border: "1px solid var(--shop-border)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-gray-700">Desktop Preview</p>
              {value.image && (
                <p className="mt-0.5 text-[11.5px] text-gray-400">Drag the product image to reposition it.</p>
              )}
            </div>
            {(value.imageOffsetX !== 0 || value.imageOffsetY !== 0) && (
              <button
                type="button"
                onClick={() => setValue((prev) => ({ ...prev, imageOffsetX: 0, imageOffsetY: 0 }))}
                className="text-[11.5px] font-semibold underline"
                style={{ color: "#6B7280" }}
              >
                Reset position
              </button>
            )}
          </div>
          <div style={{ minHeight: value.slot === 3 ? "524px" : "250px" }}>
            <Banner
              ad={toAd(value)}
              slot={value.slot}
              admin
              editable
              onOffsetChange={(x, y) => setValue((prev) => ({ ...prev, imageOffsetX: x, imageOffsetY: y }))}
            />
          </div>

          <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--shop-border)" }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-gray-700">Mobile Preview</p>
                <p className="mt-0.5 text-[11.5px] text-gray-400">
                  How this slot looks on a phone — {value.slot === 1 ? "shown full-width at the top of the page." : "shown as a smaller card between product rows."}{" "}
                  {value.image && "Drag independently from the desktop image above."}
                </p>
              </div>
              {(value.imageOffsetXMobile !== 0 || value.imageOffsetYMobile !== 0) && (
                <button
                  type="button"
                  onClick={() => setValue((prev) => ({ ...prev, imageOffsetXMobile: 0, imageOffsetYMobile: 0 }))}
                  className="flex-shrink-0 text-[11.5px] font-semibold underline"
                  style={{ color: "#6B7280" }}
                >
                  Reset position
                </button>
              )}
            </div>
            <div className="mx-auto" style={{ width: "300px" }}>
              <div style={{ height: value.slot === 1 ? "300px" : "340px" }}>
                <Banner
                  ad={toAd(value)}
                  slot={value.slot}
                  isMain={value.slot === 1}
                  admin
                  editable
                  onOffsetChange={(x, y) => setValue((prev) => ({ ...prev, imageOffsetXMobile: x, imageOffsetYMobile: y }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
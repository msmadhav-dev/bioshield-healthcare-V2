"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORY_GRADIENTS = [
  { name: "Green", from: "#E8F8ED", to: "#C9F0D7" },
  { name: "Purple", from: "#EEF0FF", to: "#C9D3FF" },
  { name: "Pink", from: "#FFE4F1", to: "#F7C8DD" },
  { name: "Peach", from: "#FFE6E2", to: "#FFC4BB" },
  { name: "Blue", from: "#E4F7FC", to: "#BFEAF5" },
  { name: "Yellow", from: "#FFF9E7", to: "#FCE8B6" },
];

export default function AddCategory() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<string | null>(null);

  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState(CATEGORY_GRADIENTS[0]);
  const [imageSize, setImageSize] = useState(68);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploaded(false);
    setPreview(URL.createObjectURL(file));
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (data.url) {
        setImageUrl(data.url);
        imageUrlRef.current = data.url;
        setUploaded(true);
      } else {
        setError("Image upload failed - please try again.");
        setPreview(null);
        imageUrlRef.current = null;
      }
    } catch {
      setError("Upload error - please try again.");
      setPreview(null);
      imageUrlRef.current = null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (uploading) {
      setError("Please wait for the image to finish uploading.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          image: imageUrlRef.current ?? imageUrl ?? null,
          gradientFrom: selectedGradient.from,
          gradientTo: selectedGradient.to,
          imageSize,
        }),
      });

      const data = await res.json();

      if (data.category) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/online-store/categories"), 1400);
      } else {
        setError(data.error || "Failed to add category.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setImageUrl(null);
    setUploaded(false);
    imageUrlRef.current = null;
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Category</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Add a category with image, gradient, and image size.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8" style={{ border: "1px solid #E5E7EB" }}>
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Liver Care, Dental Care"
            className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800"
            style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
          />
        </div>

        <div className="mb-8">
          <label className="block text-[13px] font-semibold text-gray-700 mb-3">
            Card Gradient
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORY_GRADIENTS.map((gradient) => {
              const active = selectedGradient.name === gradient.name;

              return (
                <button
                  key={gradient.name}
                  type="button"
                  onClick={() => setSelectedGradient(gradient)}
                  className="flex items-center gap-3 rounded-xl p-2 text-left transition"
                  style={{ border: active ? "2px solid #4C1D95" : "1px solid #E5E7EB" }}
                >
                  <span
                    className="h-10 w-14 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                  />
                  <span className="text-[12px] font-semibold text-gray-700">
                    {gradient.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[13px] font-semibold text-gray-700">
              Image Size
            </label>
            <span className="text-[12px] font-semibold text-gray-500">{imageSize}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={95}
            value={imageSize}
            onChange={(e) => setImageSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-8">
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Category Image <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <div className="flex items-start gap-5">
            <div
              onClick={() => !preview && !uploading && inputRef.current?.click()}
              className="relative flex h-[170px] w-[170px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{
                border: preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
                cursor: preview ? "default" : "pointer",
                background: `linear-gradient(135deg, ${selectedGradient.from}, ${selectedGradient.to})`,
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.10)_42%,rgba(255,255,255,0.54)_100%)]" />

              {preview ? (
                <>
                  <div className="relative h-full w-full">
                    <Image
                      src={preview}
                      alt="preview"
                      fill
                      className="object-contain drop-shadow-xl"
                      style={{ padding: `${Math.max(4, (100 - imageSize) / 2)}%` }}
                      sizes="170px"
                      unoptimized
                    />
                  </div>

                  {uploading && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
                    >
                      <Loader2 size={22} className="animate-spin text-brand-purple" />
                    </div>
                  )}

                  {!uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </>
              ) : (
                <div className="relative flex flex-col items-center justify-center gap-1.5">
                  <Upload size={20} className="text-gray-500" strokeWidth={1.5} />
                  <p className="px-2 text-center text-[10px] text-gray-500">Click to upload</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {uploading && (
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Uploading to cloud...
                </div>
              )}
              {uploaded && !uploading && (
                <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#166534" }}>
                  <CheckCircle size={14} />
                  Image uploaded successfully
                </div>
              )}
              {!preview && (
                <p className="max-w-[220px] text-[11.5px] leading-relaxed text-gray-400">
                  Upload the image that should float over the gradient card.
                </p>
              )}
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

        {error && <p className="mb-4 text-[13px] text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || success || uploading}
          className="flex items-center gap-2 px-7 py-3 text-[13px] font-semibold text-white transition-all"
          style={{
            backgroundColor: success ? "#166534" : uploading ? "#9CA3AF" : "#4C1D95",
            cursor: submitting || success || uploading ? "not-allowed" : "pointer",
          }}
        >
          {success ? (
            <>
              <CheckCircle size={15} /> Added!
            </>
          ) : submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Adding...
            </>
          ) : uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Uploading image...
            </>
          ) : (
            "Add Category"
          )}
        </button>
      </div>
    </div>
  );
}
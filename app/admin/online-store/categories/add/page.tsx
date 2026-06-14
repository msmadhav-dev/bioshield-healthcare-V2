"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddCategory() {
  const router        = useRouter();
  const inputRef      = useRef<HTMLInputElement>(null);
  const imageUrlRef   = useRef<string | null>(null); // ref to avoid stale closure

  const [name,       setName]       = useState("");
  const [preview,    setPreview]    = useState<string | null>(null);
  const [imageUrl,   setImageUrl]   = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploaded,   setUploaded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploaded(false);
    setPreview(URL.createObjectURL(file));
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (data.url) {
        setImageUrl(data.url);
        imageUrlRef.current = data.url; // always up to date
        setUploaded(true);
      } else {
        setError("Image upload failed — please try again.");
        setPreview(null);
        imageUrlRef.current = null;
      }
    } catch {
      setError("Upload error — please try again.");
      setPreview(null);
      imageUrlRef.current = null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Category name is required."); return; }
    if (uploading)    { setError("Please wait for the image to finish uploading."); return; }

    setError("");
    setSubmitting(true);

    try {
      const res  = await fetch("/api/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:  name.trim(),
          image: imageUrlRef.current ?? null,  // use ref, never stale
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
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Category</h1>
        <p className="text-sm text-gray-500 mt-0.5">Add a shop category with an optional image.</p>
      </div>

      <div className="bg-white p-6 md:p-8" style={{ border: "1px solid #E5E7EB" }}>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. General, Dental, Ortho"
            className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800"
            style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
            onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
            onBlur={(e)  => (e.target.style.borderColor = "#D1D5DB")}
          />
        </div>

        {/* Image uploader */}
        <div className="mb-8">
          <label className="block text-[13px] font-semibold text-gray-700 mb-2">
            Category Image{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <div className="flex items-start gap-4">
            {/* Upload box */}
            <div
              onClick={() => !preview && !uploading && inputRef.current?.click()}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width:           "120px",
                height:          "120px",
                border:          preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
                cursor:          preview ? "default" : "pointer",
                backgroundColor: "#FAFAFA",
                borderRadius:    "10px",
              }}
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    className="object-contain p-2"
                    sizes="120px"
                    unoptimized
                  />
                  {/* Uploading overlay */}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.8)" }}>
                      <Loader2 size={22} className="animate-spin text-brand-purple" />
                    </div>
                  )}
                  {/* Clear button */}
                  {!uploading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearImage(); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                      <X size={12} className="text-white" />
                    </button>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <Upload size={20} className="text-gray-400" strokeWidth={1.5} />
                  <p className="text-[10px] text-gray-400 text-center px-2">Click to upload</p>
                </div>
              )}
            </div>

            {/* Upload status */}
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
              {preview && !uploading && !uploaded && (
                <p className="text-[11px] text-orange-500">Upload may have failed — try re-selecting the image.</p>
              )}
              {!preview && (
                <p className="text-[11.5px] text-gray-400 leading-relaxed max-w-[180px]">
                  Upload a product or icon image for this category.
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
              e.target.value = ""; // reset so same file can be re-selected
            }}
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || success || uploading}
          className="flex items-center gap-2 px-7 py-3 text-[13px] font-semibold text-white transition-all"
          style={{
            backgroundColor: success ? "#166534" : uploading ? "#9CA3AF" : "#4C1D95",
            cursor:          (submitting || success || uploading) ? "not-allowed" : "pointer",
            opacity:         uploading ? 0.7 : 1,
          }}
        >
          {success ? (
            <><CheckCircle size={15} /> Added!</>
          ) : submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Adding...</>
          ) : uploading ? (
            <><Loader2 size={15} className="animate-spin" /> Uploading image...</>
          ) : (
            "Add Category"
          )}
        </button>
      </div>
    </div>
  );
}
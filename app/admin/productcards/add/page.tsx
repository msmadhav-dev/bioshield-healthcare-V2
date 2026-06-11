"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function ImageUploader({
  label,
  required,
  preview,
  onChange,
  onClear,
  uploading,
}: {
  label:     string;
  required?: boolean;
  preview:   string | null;
  onChange:  (file: File) => void;
  onClear:   () => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {!required && (
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        )}
      </label>

      <div
        onClick={() => !preview && inputRef.current?.click()}
        className="relative overflow-hidden transition-colors"
        style={{
          width:           "100%",
          aspectRatio:     "3/4",
          maxWidth:        "220px",
          border:          preview ? "1px solid #E5E7EB" : "2px dashed #D1D5DB",
          cursor:          preview ? "default" : "pointer",
          backgroundColor: preview ? "#fff" : "#FAFAFA",
        }}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="preview"
              fill
              className="object-cover"
              sizes="220px"
            />
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <X size={14} className="text-white" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              <>
                <Upload size={22} className="text-gray-400" strokeWidth={1.5} />
                <p className="text-[11px] text-gray-400 text-center px-4">
                  Click to upload
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
    </div>
  );
}

export default function AddProductCard() {
  const router = useRouter();

  const [name,           setName]          = useState("");
  const [category,       setCategory]      = useState("general");
  const [frontPreview,   setFrontPreview]  = useState<string | null>(null);
  const [backPreview,    setBackPreview]   = useState<string | null>(null);
  const [frontUrl,       setFrontUrl]      = useState<string | null>(null);
  const [backUrl,        setBackUrl]       = useState<string | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack,  setUploadingBack]  = useState(false);
  const [submitting,     setSubmitting]    = useState(false);
  const [success,        setSuccess]       = useState(false);
  const [error,          setError]         = useState("");

  const uploadImage = async (
    file:         File,
    setUploading: (v: boolean) => void,
    setPreview:   (v: string)  => void,
    setUrl:       (v: string)  => void,
  ) => {
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
      } else {
        setError("Image upload failed. Please try again.");
        setPreview("");
      }
    } catch (err) {
      console.error(err);
      setError("Upload error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Card name is required."); return; }
    if (!frontUrl)    { setError("Front image is required."); return; }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/productcards", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       name.trim(),
          category,
          frontImage: frontUrl,
          backImage:  backUrl ?? undefined,
        }),
      });

      const data = await res.json();

      if (data.card) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/productcards");
        }, 1500);
      } else {
        setError(data.error || "Failed to add card.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Add Product Card</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload front and back card images.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8" style={{ border: "1px solid #E5E7EB" }}>

        {/* Name + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Card Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Azimeez 500"
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 placeholder-gray-400"
              style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
              onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
              onBlur={(e)  => (e.target.style.borderColor = "#D1D5DB")}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] outline-none text-gray-800 cursor-pointer"
              style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
              onFocus={(e) => (e.target.style.borderColor = "#4C1D95")}
              onBlur={(e)  => (e.target.style.borderColor = "#D1D5DB")}
            >
              <option value="general">General</option>
              <option value="dental">Dental</option>
              <option value="ortho">Ortho</option>
            </select>
          </div>
        </div>

        {/* Image uploaders */}
        <div className="flex flex-wrap gap-10 mb-8">
          <ImageUploader
            label="Front Card Image"
            required
            preview={frontPreview}
            uploading={uploadingFront}
            onChange={(file) =>
              uploadImage(file, setUploadingFront, setFrontPreview, setFrontUrl)
            }
            onClear={() => { setFrontPreview(null); setFrontUrl(null); }}
          />
          <ImageUploader
            label="Back Card Image"
            preview={backPreview}
            uploading={uploadingBack}
            onChange={(file) =>
              uploadImage(file, setUploadingBack, setBackPreview, setBackUrl)
            }
            onClear={() => { setBackPreview(null); setBackUrl(null); }}
          />
        </div>

        {error && (
          <p className="text-[13px] text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || success}
          className="flex items-center gap-2 px-7 py-3 text-[13px] font-semibold text-white transition-all"
          style={{
            backgroundColor: success ? "#166534" : "#4C1D95",
            opacity:         submitting ? 0.7 : 1,
            cursor:          submitting || success ? "not-allowed" : "pointer",
          }}
        >
          {success ? (
            <><CheckCircle size={16} /> Added Successfully</>
          ) : submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Adding...</>
          ) : (
            "Add Card"
          )}
        </button>
      </div>
    </div>
  );
}
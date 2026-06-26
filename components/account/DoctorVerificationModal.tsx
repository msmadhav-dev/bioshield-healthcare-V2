"use client";

import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";
const BLACK = "#111111";
const BORDER_GRAY = "#E0E0E5";

function UploadField({
  label, fileUrl, uploading, onUpload, onClear,
}: {
  label: string; fileUrl: string; uploading: boolean;
  onUpload: (f: File) => void; onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      {fileUrl ? (
        <div className="flex items-center gap-3 px-4 py-3" style={{ border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px" }}>
          <img src={fileUrl} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "8px" }} />
          <span className="text-[12.5px] text-gray-600 flex-1">Uploaded</span>
          <button type="button" onClick={onClear} className="text-[12px] font-bold" style={{ color: "#DC2626" }}>Remove</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold text-gray-500"
          style={{ border: `1.5px dashed ${BORDER_GRAY}`, borderRadius: "12px" }}
        >
          {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : "Upload photo"}
        </button>
      )}
      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
    </div>
  );
}

export default function DoctorVerificationModal({
  onClose, onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [doctorName,   setDoctorName]   = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [registerNo,   setRegisterNo]   = useState("");
  const [registerUrl,  setRegisterUrl]  = useState("");
  const [dlNo,         setDlNo]         = useState("");
  const [dlUrl,        setDlUrl]        = useState("");
  const [address,      setAddress]      = useState("");

  const [uploadingReg, setUploadingReg] = useState(false);
  const [uploadingDl,  setUploadingDl]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const inputStyle = { border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px", backgroundColor: "#FFFFFF" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = BLACK);
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = BORDER_GRAY);

  const uploadFile = async (file: File, setUrl: (u: string) => void, setUploading: (b: boolean) => void) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "bioshield/doctor-verification");
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setUrl(data.url);
      else setError("Upload failed. Please try again.");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!doctorName.trim())   { setError("Please enter the doctor's name."); return; }
    if (!hospitalName.trim()) { setError("Please enter the hospital name."); return; }
    if (!address.trim())      { setError("Please enter the address."); return; }
    if (!registerNo.trim() && !registerUrl && !dlNo.trim() && !dlUrl) {
      setError("Either Register No. or DL No. (or its photo) is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/doctor-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName, hospitalName, address,
          registerNo: registerNo || null, registerProofUrl: registerUrl || null,
          dlNo: dlNo || null, dlProofUrl: dlUrl || null,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.verification) {
        onSubmitted();
        onClose();
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setSaving(false);
      setError("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-7 max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-1">Doctor Verification</h3>
        <p className="text-[13px] text-gray-500 mb-5">Submit your details for our team to verify.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Doctor Name <span className="text-red-500">*</span></label>
            <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Hospital Name <span className="text-red-500">*</span></label>
            <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div className="p-4 rounded-2xl" style={{ backgroundColor: "#FAFAFA" }}>
            <p className="text-[12px] font-bold text-gray-700 mb-3">Register No.</p>
            <input value={registerNo} onChange={(e) => setRegisterNo(e.target.value)} placeholder="Enter Register No." className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400 mb-3" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            <p className="text-[11px] text-gray-400 mb-2 text-center">— or —</p>
            <UploadField label="" fileUrl={registerUrl} uploading={uploadingReg} onUpload={(f) => uploadFile(f, setRegisterUrl, setUploadingReg)} onClear={() => setRegisterUrl("")} />
          </div>

          <div className="p-4 rounded-2xl" style={{ backgroundColor: "#FAFAFA" }}>
            <p className="text-[12px] font-bold text-gray-700 mb-3">DL No.</p>
            <input value={dlNo} onChange={(e) => setDlNo(e.target.value)} placeholder="Enter DL No." className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400 mb-3" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            <p className="text-[11px] text-gray-400 mb-2 text-center">— or —</p>
            <UploadField label="" fileUrl={dlUrl} uploading={uploadingDl} onUpload={(f) => uploadFile(f, setDlUrl, setUploadingDl)} onClear={() => setDlUrl("")} />
          </div>

          <p className="text-[11.5px] text-gray-400 italic">Note: Either a DL No. or Register No. (or its photo) must be provided.</p>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Address <span className="text-red-500">*</span></label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>

        {error && <p className="text-[12.5px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full text-[13.5px] font-bold text-gray-700" style={{ border: `1.5px solid ${BORDER_GRAY}` }}>
            Cancel
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={saving || uploadingReg || uploadingDl}
            className="flex-1 py-3 rounded-full text-[13.5px] font-bold flex items-center justify-center gap-2"
            style={{ background: YELLOW_GRADIENT, color: "#1A1A1A", opacity: (saving || uploadingReg || uploadingDl) ? 0.7 : 1 }}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

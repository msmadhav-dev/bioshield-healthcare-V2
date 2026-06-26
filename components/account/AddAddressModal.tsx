"use client";

import { useState, useEffect, useRef } from "react";

const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";
const BORDER_GRAY = "#E0E0E5";
const BLACK = "#111111";

export default function AddAddressModal({
  onClose, onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label,    setLabel]    = useState("");
  const [doorNo,   setDoorNo]   = useState("");
  const [street,   setStreet]   = useState("");
  const [cityTown, setCityTown] = useState("");
  const [pincode,  setPincode]  = useState("");

  const [district,    setDistrict]    = useState("");
  const [state,       setState]       = useState("");
  const [pinLoading,  setPinLoading]  = useState(false);
  const [pinError,    setPinError]    = useState("");

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-resolve district + state as soon as 6 digits are typed.
  useEffect(() => {
    setDistrict(""); setState(""); setPinError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!/^\d{6}$/.test(pincode)) return;

    debounceRef.current = setTimeout(async () => {
      setPinLoading(true);
      try {
        const res  = await fetch(`/api/pincode/${pincode}`);
        const data = await res.json();
        if (data.district) { setDistrict(data.district); setState(data.state); }
        else setPinError(data.error || "PIN code not found.");
      } catch {
        setPinError("Could not look up that PIN code.");
      } finally {
        setPinLoading(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [pincode]);

  const inputStyle = { border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px", backgroundColor: "#FFFFFF" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = BLACK);
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = BORDER_GRAY);

  const handleSave = async () => {
    setError("");
    if (!label.trim())            { setError("Label is required."); return; }
    if (!doorNo.trim())           { setError("Door no. is required."); return; }
    if (!street.trim())           { setError("Street/Landmark is required."); return; }
    if (!cityTown.trim())         { setError("City/Town is required."); return; }
    if (!/^\d{6}$/.test(pincode)) { setError("Please enter a valid 6-digit PIN code."); return; }
    if (!district)                { setError("We couldn't find a district for that PIN code."); return; }

    setSaving(true);
    try {
      const res  = await fetch("/api/addresses", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ label, doorNo, street, cityTown, pincode }),
      });
      const data = await res.json();
      setSaving(false);
      if (data.address) {
        onSaved();
        onClose();
      } else {
        setError(data.error || "Failed to save address.");
      }
    } catch {
      setSaving(false);
      setError("Failed to save address.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-7 max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-5">Add Address</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Home, Work"
              className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Door No <span className="text-red-500">*</span>
            </label>
            <input
              value={doorNo} onChange={(e) => setDoorNo(e.target.value)} placeholder="e.g. 12B"
              className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              Street / Landmark <span className="text-red-500">*</span>
            </label>
            <input
              value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. Anna Salai, near City Hospital"
              className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              City / Town <span className="text-red-500">*</span>
            </label>
            <input
              value={cityTown} onChange={(e) => setCityTown(e.target.value)} placeholder="e.g. Koyambedu"
              className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit PIN code"
              className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400"
              style={{ ...inputStyle, maxWidth: "180px" }}
              onFocus={onFocus} onBlur={onBlur}
            />

            {/* Auto-filled from the PIN code */}
            {(pinLoading || district || pinError) && (
              <div className="mt-2.5 px-4 py-3" style={{ border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px", backgroundColor: "#FAFAFA" }}>
                {pinLoading && <p className="text-[12.5px] text-gray-400">Looking up district &amp; state...</p>}
                {district && !pinLoading && (
                  <p className="text-[13px] font-semibold text-gray-800">{district}, {state}</p>
                )}
                {pinError && !pinLoading && <p className="text-[12px]" style={{ color: "#DC2626" }}>{pinError}</p>}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-[12.5px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full text-[13.5px] font-bold text-gray-700" style={{ border: `1.5px solid ${BORDER_GRAY}` }}>
            Cancel
          </button>
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-full text-[13.5px] font-bold"
            style={{ background: YELLOW_GRADIENT, color: "#1A1A1A", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

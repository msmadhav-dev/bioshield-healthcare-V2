"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Truck } from "lucide-react";

export default function SiteSettingsPage() {
  const [threshold,  setThreshold]  = useState("400");
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        setThreshold(String(d.settings?.freeDeliveryThreshold ?? 400));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(""); setSaving(true); setSuccess(false);
    try {
      const res  = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeDeliveryThreshold: Number(threshold) }),
      });
      const data = await res.json();
      if (data.settings) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else { setError(data.error || "Failed to save."); }
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Global settings shown across the shop.</p>
      </div>

      <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} style={{ color: "#14532D" }} />
          <h3 className="text-[14px] font-bold text-gray-800">Free Delivery Threshold</h3>
        </div>
        <p className="text-[12px] text-gray-400 mb-4">
          Shown on every product page as &quot;Free delivery on orders above ₹X&quot;
        </p>

        {loading ? (
          <Loader2 size={20} className="animate-spin text-gray-400" />
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[14px] text-gray-500">₹</span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="px-3 py-2.5 text-[14px] outline-none w-40"
                style={{ border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" }}
                onFocus={(e) => (e.target.style.borderColor = "#14532D")}
                onBlur={(e)  => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>

            {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold text-white rounded-lg"
              style={{ backgroundColor: success ? "#166534" : "#14532D", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {success ? <><CheckCircle size={14} /> Saved!</> : saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
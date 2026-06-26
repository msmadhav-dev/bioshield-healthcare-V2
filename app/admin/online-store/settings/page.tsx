"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Truck } from "lucide-react";

export default function SiteSettingsPage() {
  const [perKg,            setPerKg]            = useState("30");
  const [customerThreshold, setCustomerThreshold] = useState("500");
  const [doctorThreshold,   setDoctorThreshold]   = useState("1000");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        setPerKg(String(d.settings?.deliveryChargePerKg ?? 30));
        setCustomerThreshold(String(d.settings?.customerFreeDeliveryThreshold ?? 500));
        setDoctorThreshold(String(d.settings?.doctorFreeDeliveryThreshold ?? 1000));
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
        body: JSON.stringify({
          deliveryChargePerKg:           Number(perKg),
          customerFreeDeliveryThreshold: Number(customerThreshold),
          doctorFreeDeliveryThreshold:   Number(doctorThreshold),
        }),
      });
      const data = await res.json();
      if (data.settings) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else { setError(data.error || "Failed to save."); }
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  };

  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#14532D");
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#D1D5DB");

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-800">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Global settings shown across the shop.</p>
      </div>

      <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} style={{ color: "#14532D" }} />
          <h3 className="text-[14px] font-bold text-gray-800">Delivery Charges</h3>
        </div>

        {loading ? (
          <Loader2 size={20} className="animate-spin text-gray-400" />
        ) : (
          <>
            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Delivery charge per 1kg</label>
              <p className="text-[11.5px] text-gray-400 mb-2">
                Cart weight rounds up to the next kg — e.g. 1.4kg of products is charged as 2kg.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">₹</span>
                <input
                  type="number" value={perKg} onChange={(e) => setPerKg(e.target.value)}
                  className="px-3 py-2.5 text-[14px] outline-none w-32"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
                <span className="text-[13px] text-gray-400">per kg</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Free delivery above (Customers)</label>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">₹</span>
                <input
                  type="number" value={customerThreshold} onChange={(e) => setCustomerThreshold(e.target.value)}
                  className="px-3 py-2.5 text-[14px] outline-none w-32"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Free delivery above (Doctors)</label>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-gray-500">₹</span>
                <input
                  type="number" value={doctorThreshold} onChange={(e) => setDoctorThreshold(e.target.value)}
                  className="px-3 py-2.5 text-[14px] outline-none w-32"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
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

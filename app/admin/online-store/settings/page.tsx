"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Truck, Clock } from "lucide-react";

export default function SiteSettingsPage() {
  const [perKg,             setPerKg]             = useState("30");
  const [customerThreshold, setCustomerThreshold] = useState("500");
  const [doctorThreshold,   setDoctorThreshold]   = useState("1000");

  const [cutoffHour,    setCutoffHour]    = useState("13");
  const [fastDaysMin,   setFastDaysMin]   = useState("1");
  const [fastDaysMax,   setFastDaysMax]   = useState("2");
  const [slowDaysMin,   setSlowDaysMin]   = useState("2");
  const [slowDaysMax,   setSlowDaysMax]   = useState("3");

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setPerKg(String(s.deliveryChargePerKg ?? 30));
        setCustomerThreshold(String(s.customerFreeDeliveryThreshold ?? 500));
        setDoctorThreshold(String(s.doctorFreeDeliveryThreshold ?? 1000));
        setCutoffHour(String(s.deliveryCutoffHour ?? 13));
        setFastDaysMin(String(s.deliveryFastDaysMin ?? 1));
        setFastDaysMax(String(s.deliveryFastDaysMax ?? 2));
        setSlowDaysMin(String(s.deliverySlowDaysMin ?? 2));
        setSlowDaysMax(String(s.deliverySlowDaysMax ?? 3));
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
          deliveryCutoffHour:            Number(cutoffHour),
          deliveryFastDaysMin:           Number(fastDaysMin),
          deliveryFastDaysMax:           Number(fastDaysMax),
          deliverySlowDaysMin:           Number(slowDaysMin),
          deliverySlowDaysMax:           Number(slowDaysMax),
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
  const numField = (label: string, value: string, setValue: (v: string) => void, width = "w-32", prefix?: string) => (
    <div className="mb-4">
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-[14px] text-gray-500">{prefix}</span>}
        <input
          type="number" value={value} onChange={(e) => setValue(e.target.value)}
          className={`px-3 py-2.5 text-[14px] outline-none ${width}`}
          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Global settings shown across the shop.</p>
      </div>

      <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} style={{ color: "#14532D" }} />
          <h3 className="text-[14px] font-bold text-gray-800">Delivery Charges</h3>
        </div>

        {loading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : (
          <>
            {numField("Delivery charge per 1kg", perKg, setPerKg, "w-32", "₹")}
            <p className="text-[11.5px] text-gray-400 -mt-3 mb-4">Cart weight rounds up to the next kg — e.g. 1.4kg is charged as 2kg.</p>
            {numField("Free delivery above (Customers)", customerThreshold, setCustomerThreshold, "w-32", "₹")}
            {numField("Free delivery above (Doctors)", doctorThreshold, setDoctorThreshold, "w-32", "₹")}
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} style={{ color: "#14532D" }} />
          <h3 className="text-[14px] font-bold text-gray-800">Delivery Time Estimate</h3>
        </div>

        {loading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : (
          <>
            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Cutoff hour (24h format)</label>
              <input
                type="number" min={0} max={23} value={cutoffHour} onChange={(e) => setCutoffHour(e.target.value)}
                className="px-3 py-2.5 text-[14px] outline-none w-24"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
              <p className="text-[11.5px] text-gray-400 mt-1.5">e.g. 13 = 1:00 PM. Orders before this hour get the faster estimate below.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Before cutoff — min days</label>
                <input type="number" value={fastDaysMin} onChange={(e) => setFastDaysMin(e.target.value)} className="px-3 py-2.5 text-[14px] outline-none w-full" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Before cutoff — max days</label>
                <input type="number" value={fastDaysMax} onChange={(e) => setFastDaysMax(e.target.value)} className="px-3 py-2.5 text-[14px] outline-none w-full" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">After cutoff — min days</label>
                <input type="number" value={slowDaysMin} onChange={(e) => setSlowDaysMin(e.target.value)} className="px-3 py-2.5 text-[14px] outline-none w-full" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">After cutoff — max days</label>
                <input type="number" value={slowDaysMax} onChange={(e) => setSlowDaysMax(e.target.value)} className="px-3 py-2.5 text-[14px] outline-none w-full" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold text-white rounded-lg"
        style={{ backgroundColor: success ? "#166534" : "#14532D", cursor: saving ? "not-allowed" : "pointer" }}
      >
        {success ? <><CheckCircle size={14} /> Saved!</> : saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Settings"}
      </button>
    </div>
  );
}

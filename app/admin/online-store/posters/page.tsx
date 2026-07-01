"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, RefreshCw, Plus, Upload, X } from "lucide-react";

type Poster  = { id: string; image: string; linkUrl?: string | null; order: number };
type Section = { id: string; name: string };

export default function ManagePosters() {
  const [posters,  setPosters]  = useState<Poster[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,    setError]    = useState("");

  // New poster form
  const [showForm, setShowForm] = useState(false);
  const [image,    setImage]    = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkUrl,  setLinkUrl]  = useState("");
  const [order,    setOrder]    = useState("0");
  const [adding,   setAdding]   = useState(false);

  // Section position config
  const [enabled,  setEnabled]  = useState(false);
  const [position, setPosition] = useState(0);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [postersRes, sectionsRes, configRes] = await Promise.all([
        fetch("/api/posters").then((r) => r.json()),
        fetch("/api/shop-sections").then((r) => r.json()),
        fetch("/api/poster-section-config").then((r) => r.json()),
      ]);
      setPosters(postersRes.posters || []);
      setSections(sectionsRes.sections || []);
      if (configRes.config) {
        setEnabled(configRes.config.enabled);
        setPosition(configRes.config.position);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setImage(data.url);
      else setError("Image upload failed.");
    } catch {
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const handleAdd = async () => {
    if (!image) { setError("Upload an image first."); return; }
    setAdding(true); setError("");
    try {
      const res  = await fetch("/api/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, linkUrl: linkUrl || null, order: Number(order) }),
      });
      const data = await res.json();
      if (data.poster) {
        setPosters((p) => [...p, data.poster].sort((a, b) => a.order - b.order));
        setImage(null); setLinkUrl(""); setOrder("0"); setShowForm(false);
      } else { setError(data.error || "Failed."); }
    } catch { setError("Something went wrong."); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poster?")) return;
    setDeleting(id);
    await fetch(`/api/posters/${id}`, { method: "DELETE" });
    setPosters((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true); setConfigSaved(false);
    try {
      await fetch("/api/poster-section-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, position }),
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2000);
    } finally { setSavingConfig(false); }
  };

  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Posters</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            A poster carousel row — 2 posters visible on desktop, 1 on mobile, auto-scrolling with drag support. Each poster can link to a product page.
          </p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="p-2 rounded-lg text-gray-500" style={{ backgroundColor: "#F3F4F6" }}>
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Where the poster row appears */}
      <div className="bg-white p-5 rounded-xl mb-6" style={{ border: "1px solid #E5E7EB" }}>
        <h3 className="text-[13px] font-bold text-gray-800 mb-1">Section Position</h3>
        <p className="text-[12px] text-gray-500 mb-4">Choose where the poster row sits among your shop sections.</p>

        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4" id="poster-enabled" />
          <label htmlFor="poster-enabled" className="text-[13px] font-semibold text-gray-700">
            Show the poster row on the shop page
          </label>
        </div>

        {enabled && (
          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">Insert</label>
            <select value={position} onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full px-3 py-2 text-[13px] outline-none" style={inputStyle}>
              <option value={0}>Before all sections</option>
              {sections.map((s, i) => (
                <option key={s.id} value={i + 1}>
                  After &quot;{s.name}&quot;
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={handleSaveConfig} disabled={savingConfig}
          className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-lg"
          style={{ backgroundColor: configSaved ? "#22C55E" : "#4C1D95" }}>
          {savingConfig ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : configSaved ? "Saved" : "Save Position"}
        </button>
      </div>

      {/* Poster list */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-gray-800">Posters</h3>
        <button onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-lg"
          style={{ backgroundColor: "#4C1D95" }}>
          <Plus size={14} /> Add Poster
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-xl mb-5" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4">New Poster</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                Poster Image * <span className="text-gray-400 font-normal">(sample posters are ~7:5 — a bit taller than a typical wide banner)</span>
              </label>
              {image ? (
                <div className="relative inline-block">
                  <img src={image} alt="" className="rounded-lg" style={{ width: "220px", aspectRatio: "7/5", objectFit: "cover" }} />
                  <button onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: "#374151" }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-lg cursor-pointer"
                  style={{ width: "220px", aspectRatio: "7/5", border: "2px dashed #D1D5DB", backgroundColor: "#FAFAFA" }}>
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Upload size={18} className="text-gray-400 mb-1" />
                      <span className="text-[11px] text-gray-400">Click to upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                Product Link <span className="text-gray-400 font-normal">(optional — where tapping the poster goes)</span>
              </label>
              <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/shop/products/ketolol" className="w-full px-3 py-2 text-[13px] outline-none"
                style={inputStyle} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">Order (lower = first)</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                className="w-24 px-3 py-2 text-[13px] outline-none" style={inputStyle} />
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <button onClick={handleAdd} disabled={adding || uploading}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-lg"
              style={{ backgroundColor: "#4C1D95" }}>
              {adding ? <><Loader2 size={13} className="animate-spin" /> Adding...</> : "Save Poster"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : posters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed" style={{ borderColor: "#E5E7EB" }}>
          <p className="text-gray-400 font-medium">No posters yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first poster above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posters.map((poster) => (
            <div key={poster.id} className="bg-white p-3 rounded-xl flex items-center justify-between gap-3"
              style={{ border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-3 min-w-0">
                <img src={poster.image} alt="" className="rounded-lg flex-shrink-0" style={{ width: "72px", aspectRatio: "7/5", objectFit: "cover" }} />
                <div className="min-w-0">
                  <p className="text-[12px] text-gray-500 truncate">{poster.linkUrl || "No link set"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Order: {poster.order}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(poster.id)} disabled={deleting === poster.id}
                className="p-1.5 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                {deleting === poster.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
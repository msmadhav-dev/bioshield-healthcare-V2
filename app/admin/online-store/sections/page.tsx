"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, RefreshCw, Plus } from "lucide-react";

type Section = { id: string; name: string; subtitle?: string | null; order: number };

export default function ManageSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,    setError]    = useState("");
  const [name,     setName]     = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [order,    setOrder]    = useState("0");
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/shop-sections");
      const data = await res.json();
      setSections(data.sections || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleAdd = async () => {
    if (!name.trim()) { setError("Section name required."); return; }
    setAdding(true); setError("");
    try {
      const res  = await fetch("/api/shop-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subtitle: subtitle || null, order: Number(order) }),
      });
      const data = await res.json();
      if (data.section) {
        setSections((p) => [...p, data.section].sort((a, b) => a.order - b.order));
        setName(""); setSubtitle(""); setOrder("0"); setShowForm(false);
      } else { setError(data.error || "Failed."); }
    } catch { setError("Something went wrong."); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section? Products in it won't be deleted.")) return;
    setDeleting(id);
    await fetch(`/api/shop-sections/${id}`, { method: "DELETE" });
    setSections((p) => p.filter((s) => s.id !== id));
    setDeleting(null);
  };

  const inputStyle = { border: "1px solid #D1D5DB", backgroundColor: "#FAFAFA" };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Shop Sections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sections appear as rows on the shop homepage (e.g. &quot;New Launches&quot;, &quot;Trending&quot;)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSections} disabled={loading}
            className="p-2 rounded-lg text-gray-500" style={{ backgroundColor: "#F3F4F6" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white rounded-lg"
            style={{ backgroundColor: "#4C1D95" }}>
            <Plus size={14} /> Add Section
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl mb-5" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4">New Section</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">Section Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New Launches" className="w-full px-3 py-2 text-[13px] outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">Subtitle</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. New wellness range just for you!" className="w-full px-3 py-2 text-[13px] outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">Display Order (lower = first)</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                className="w-24 px-3 py-2 text-[13px] outline-none" style={inputStyle} />
            </div>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <button onClick={handleAdd} disabled={adding}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-lg"
              style={{ backgroundColor: "#4C1D95" }}>
              {adding ? <><Loader2 size={13} className="animate-spin" /> Adding...</> : "Save Section"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed" style={{ borderColor: "#E5E7EB" }}>
          <p className="text-gray-400 font-medium">No sections yet</p>
          <p className="text-gray-400 text-sm mt-1">Add &quot;New Launches&quot; as your first section.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div key={section.id} className="bg-white p-4 rounded-xl flex items-center justify-between"
              style={{ border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: "#4C1D95" }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800">{section.name}</p>
                  {section.subtitle && <p className="text-[12px] text-gray-500">{section.subtitle}</p>}
                  <p className="text-[10px] text-gray-400 mt-0.5">Order: {section.order}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(section.id)} disabled={deleting === section.id}
                className="p-1.5 text-red-400 hover:text-red-600 transition-colors">
                {deleting === section.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
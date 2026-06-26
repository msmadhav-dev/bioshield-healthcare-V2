"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, X } from "lucide-react";

type Verification = {
  id: string; doctorName: string; hospitalName: string;
  registerNo?: string | null; registerProofUrl?: string | null;
  dlNo?: string | null; dlProofUrl?: string | null;
  address: string; status: string; rejectionReason?: string | null;
  createdAt: string;
  user: { name: string; phone: string; email?: string | null };
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: "#FEF3C7", color: "#92400E" },
  APPROVED: { bg: "#DCFCE7", color: "#166534" },
  REJECTED: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function DoctorVerificationAdminPage() {
  const [items,   setItems]   = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/doctor-verifications")
      .then((r) => r.json())
      .then((d) => setItems(d.verifications || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    setActingId(id);
    try {
      await fetch(`/api/admin/doctor-verifications/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status, rejectionReason }),
      });
      setRejectingId(null);
      setRejectReason("");
      load();
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Doctor Verification</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review submitted credentials and accept or reject each request.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={22} className="animate-spin text-gray-400" /></div>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-gray-400">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((v) => {
            const style = STATUS_STYLE[v.status] || STATUS_STYLE.PENDING;
            return (
              <div key={v.id} className="bg-white p-5 rounded-xl" style={{ border: "1px solid #E5E7EB" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[15px] font-bold text-gray-900">{v.doctorName}</p>
                    <p className="text-[12.5px] text-gray-500">{v.hospitalName}</p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5">
                      Account: {v.user.name} · +91 {v.user.phone} {v.user.email ? `· ${v.user.email}` : ""}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ backgroundColor: style.bg, color: style.color }}>
                    {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-[12.5px]">
                  <div>
                    <p className="text-gray-400">Register No.</p>
                    <p className="font-semibold text-gray-800">{v.registerNo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">DL No.</p>
                    <p className="font-semibold text-gray-800">{v.dlNo || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Address</p>
                    <p className="font-semibold text-gray-800">{v.address}</p>
                  </div>
                </div>

                {(v.registerProofUrl || v.dlProofUrl) && (
                  <div className="flex gap-3 mb-4">
                    {v.registerProofUrl && (
                      <a href={v.registerProofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={v.registerProofUrl} alt="Register proof" className="w-20 h-20 object-cover rounded-lg" style={{ border: "1px solid #E5E7EB" }} />
                      </a>
                    )}
                    {v.dlProofUrl && (
                      <a href={v.dlProofUrl} target="_blank" rel="noopener noreferrer">
                        <img src={v.dlProofUrl} alt="DL proof" className="w-20 h-20 object-cover rounded-lg" style={{ border: "1px solid #E5E7EB" }} />
                      </a>
                    )}
                  </div>
                )}

                {v.status === "REJECTED" && v.rejectionReason && (
                  <p className="text-[12px] mb-3" style={{ color: "#991B1B" }}>Rejection reason: {v.rejectionReason}</p>
                )}

                {v.status === "PENDING" && (
                  <>
                    {rejectingId === v.id ? (
                      <div className="flex gap-2">
                        <input
                          value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="flex-1 px-3 py-2 text-[13px] rounded-lg outline-none"
                          style={{ border: "1px solid #E5E7EB" }}
                        />
                        <button onClick={() => act(v.id, "REJECTED", rejectReason)} disabled={actingId === v.id} className="px-4 py-2 rounded-lg text-[12.5px] font-bold text-white" style={{ backgroundColor: "#DC2626" }}>
                          Confirm Reject
                        </button>
                        <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-gray-600" style={{ border: "1px solid #E5E7EB" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => act(v.id, "APPROVED")} disabled={actingId === v.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold text-white"
                          style={{ backgroundColor: "#166534" }}
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => setRejectingId(v.id)} disabled={actingId === v.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-bold text-white"
                          style={{ backgroundColor: "#DC2626" }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

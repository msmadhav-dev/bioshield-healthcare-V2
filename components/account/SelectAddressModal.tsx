"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import AddAddressModal from "@/components/account/AddAddressModal";

const GREEN = "#14532D";

type Address = {
  id: string; label: string; doorNo: string; street: string;
  cityTown: string; pincode: string; district: string; state: string; isDefault: boolean;
};

export default function SelectAddressModal({
  addresses, onClose, onSelected,
}: {
  addresses: Address[];
  onClose: () => void;
  onSelected: () => void;
}) {
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const handleSelect = async (id: string) => {
    setSelectingId(id);
    try {
      await fetch(`/api/addresses/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isDefault: true }),
      });
      onSelected();
      onClose();
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-7 max-h-[85vh] overflow-y-auto" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-5">Select Delivery Address</h3>

        {addresses.length === 0 ? (
          <p className="text-[13px] text-gray-400 mb-5">You don&apos;t have any saved addresses yet.</p>
        ) : (
          <div className="space-y-3 mb-5">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => handleSelect(addr.id)}
                disabled={selectingId === addr.id}
                className="w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3"
                style={{ border: `1.5px solid ${addr.isDefault ? GREEN : "#E0E0E5"}`, backgroundColor: addr.isDefault ? "#F0FDF4" : "#FFFFFF" }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ border: `1.5px solid ${addr.isDefault ? GREEN : "#D1D5DB"}` }}
                >
                  {addr.isDefault && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />}
                </div>
                <div className="flex-1">
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                    {addr.label}
                  </span>
                  <p className="text-[13.5px] text-black font-medium leading-snug">{addr.doorNo}, {addr.street}, {addr.cityTown}</p>
                  <p className="text-[12.5px] text-gray-500 mt-0.5">{addr.district}, {addr.state} — {addr.pincode}</p>
                </div>
                {selectingId === addr.id && <Loader2 size={16} className="animate-spin text-gray-400 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}

        <button
          type="button" onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13.5px] font-bold"
          style={{ border: "1.5px dashed #FFC107", color: "#1A1A1A" }}
        >
          <Plus size={16} /> Add New Address
        </button>

        {addOpen && (
          <AddAddressModal
            onClose={() => setAddOpen(false)}
            onSaved={() => { setAddOpen(false); onSelected(); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}

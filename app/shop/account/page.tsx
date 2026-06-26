"use client";

import { useState, useEffect, useCallback } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { useAccount } from "@/components/account/AccountContext";
import EditProfileModal from "@/components/account/EditProfileModal";
import AddAddressModal from "@/components/account/AddAddressModal";
import DoctorVerificationModal from "@/components/account/DoctorVerificationModal";

const GREEN  = "#14532D";
const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";

type Address = {
  id: string; label: string; doorNo: string; street: string;
  cityTown: string; pincode: string; district: string; state: string;
};

type Verification = {
  doctorName: string; hospitalName: string; registerNo?: string | null;
  dlNo?: string | null; address: string; status: string; rejectionReason?: string | null;
};

export default function MyProfilePage() {
  const { user, refetch } = useAccount();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen,  setAddOpen]  = useState(false);

  const [verification, setVerification] = useState<Verification | null>(null);
  const [loadingVerification, setLoadingVerification] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const loadAddresses = useCallback(() => {
    setLoadingAddr(true);
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((d) => setAddresses(d.addresses || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddr(false));
  }, []);

  const loadVerification = useCallback(() => {
    setLoadingVerification(true);
    fetch("/api/doctor-verification")
      .then((r) => r.json())
      .then((d) => setVerification(d.verification || null))
      .catch(() => setVerification(null))
      .finally(() => setLoadingVerification(false));
  }, []);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);
  useEffect(() => { if (user?.role === "DOCTOR") loadVerification(); }, [user?.role, loadVerification]);

  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase();

  // Address (and therefore navbar city) just changed — the navbar fetches its
  // own /api/auth/me independently, so a full reload is the simplest way to
  // get the new district to show up there immediately.
  const handleAddressSaved = () => {
    loadAddresses();
    window.location.reload();
  };

  const handleDeleteAddress = async (id: string) => {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" }).catch(() => {});
    loadAddresses();
  };

  return (
    <div className="px-4 md:px-12 py-5 md:py-8 w-full" style={{ maxWidth: "1400px" }}>
      <h1 className="text-[19px] md:text-[26px] font-extrabold mb-4 md:mb-6" style={{ color: GREEN }}>My Profile</h1>

      {/* Profile card */}
      <div className="flex items-center gap-4 md:gap-6 p-5 md:p-8 rounded-3xl mb-4 md:mb-6 w-full md:w-[90%]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
        <div
          className="w-16 h-16 md:w-28 md:h-28 rounded-full flex items-center justify-center flex-shrink-0 text-[26px] md:text-[40px] font-extrabold"
          style={{ backgroundColor: "#D4AF37", color: "#000000" }}
        >
          {initial}
        </div>
        <div>
          <p className="text-[16px] md:text-[22px] font-extrabold text-gray-900">{user.name}</p>
          <p className="text-[13px] md:text-[15px] text-gray-600 mt-0.5 md:mt-1">{user.role === "DOCTOR" ? "Doctor" : "Customer"}</p>
          <p className="text-[13px] md:text-[15px] text-gray-600">{user.age} years old</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="p-5 md:p-8 rounded-3xl mb-4 md:mb-6 w-full md:w-[90%]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-[15px] md:text-[19px] font-extrabold" style={{ color: GREEN }}>Personal Information</h2>
          <button
            type="button" onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 md:gap-2 px-3.5 md:px-5 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13.5px] font-bold"
            style={{ background: YELLOW_GRADIENT, color: "#1A1A1A" }}
          >
            Edit <Pencil size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-y-6 gap-x-8">
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Name</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{user.name}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Email</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{user.email || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Phone Number</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">+91 {user.phone}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Age</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{user.age}</p>
          </div>
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Gender</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">
              {user.gender === "MALE" ? "Male" : user.gender === "FEMALE" ? "Female" : "Others"}
            </p>
          </div>
          <div>
            <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Account Type</p>
            <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{user.role === "DOCTOR" ? "Doctor" : "Customer"}</p>
          </div>
          {user.role === "DOCTOR" && (
            <div>
              <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Hospital Name</p>
              <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{user.hospitalName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Verification — only for doctor accounts */}
      {user.role === "DOCTOR" && (
        <div className="p-5 md:p-8 rounded-3xl mb-4 md:mb-6 w-full md:w-[90%]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
          <h2 className="text-[15px] md:text-[19px] font-extrabold mb-4 md:mb-6" style={{ color: GREEN }}>Doctor Verification</h2>

          {loadingVerification ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
          ) : !verification ? (
            <div className="flex flex-col items-center py-6">
              <p className="text-[13px] text-gray-500 mb-4 text-center">Get your doctor account verified to unlock doctor-only benefits.</p>
              <button
                type="button" onClick={() => setVerifyOpen(true)}
                className="px-8 py-3 rounded-full text-[14px] font-bold"
                style={{ background: YELLOW_GRADIENT, color: "#1A1A1A" }}
              >
                Verify
              </button>
            </div>
          ) : verification.status === "PENDING" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-[14px] font-semibold text-gray-700">Under verification, please wait</p>
              <p className="text-[12.5px] text-gray-400 mt-1">We&apos;ll notify you once your details have been reviewed.</p>
            </div>
          ) : verification.status === "REJECTED" ? (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-[14px] font-semibold" style={{ color: "#991B1B" }}>Verification rejected</p>
              {verification.rejectionReason && <p className="text-[12.5px] text-gray-500 mt-1">{verification.rejectionReason}</p>}
              <button
                type="button" onClick={() => setVerifyOpen(true)}
                className="mt-4 px-8 py-3 rounded-full text-[14px] font-bold"
                style={{ background: YELLOW_GRADIENT, color: "#1A1A1A" }}
              >
                Resubmit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
              <div>
                <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Doctor Name</p>
                <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{verification.doctorName}</p>
              </div>
              <div>
                <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Hospital Name</p>
                <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{verification.hospitalName}</p>
              </div>
              <div>
                <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Register No.</p>
                <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{verification.registerNo || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">DL No.</p>
                <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{verification.dlNo || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] md:text-[12.5px] text-gray-400 mb-1">Address</p>
                <p className="text-[13.5px] md:text-[15px] font-semibold text-black">{verification.address}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addresses */}
      <div className="p-5 md:p-8 rounded-3xl w-full md:w-[90%]" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-[15px] md:text-[19px] font-extrabold" style={{ color: GREEN }}>My Addresses</h2>
          <span className="text-[11.5px] md:text-[13px] text-gray-400">{addresses.length}/4 saved</span>
        </div>

        {loadingAddr ? (
          <p className="text-[13px] md:text-[14px] text-gray-400">Loading addresses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 md:p-5 rounded-2xl relative" style={{ border: "1px solid #EFEFEF", backgroundColor: "#FAFAFA" }}>
                <span className="text-[10.5px] md:text-[11px] font-bold px-2.5 py-1 rounded-md mb-2 inline-block" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                  {addr.label}
                </span>
                <p className="text-[13px] md:text-[14.5px] text-black leading-snug font-medium">
                  {addr.doorNo}, {addr.street}, {addr.cityTown}
                </p>
                <p className="text-[12px] md:text-[13.5px] text-gray-500 mt-1.5">{addr.district}, {addr.state} — {addr.pincode}</p>
                <button
                  type="button" onClick={() => handleDeleteAddress(addr.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {addresses.length < 4 && (
              <button
                type="button" onClick={() => setAddOpen(true)}
                className="flex items-center justify-center gap-2 p-4 md:p-5 rounded-2xl text-[13px] md:text-[14.5px] font-bold text-black"
                style={{ border: "1.5px dashed #FFC107", backgroundColor: "transparent", minHeight: "84px" }}
              >
                <Plus size={16} /> Add Address
              </button>
            )}
          </div>
        )}
      </div>

      {editOpen && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} onSaved={refetch} />
      )}
      {addOpen && (
        <AddAddressModal onClose={() => setAddOpen(false)} onSaved={handleAddressSaved} />
      )}
      {verifyOpen && (
        <DoctorVerificationModal onClose={() => setVerifyOpen(false)} onSubmitted={loadVerification} />
      )}
    </div>
  );
}

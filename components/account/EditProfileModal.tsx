"use client";

import { useState } from "react";
import type { AccountUser } from "./AccountContext";

const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";
const BLACK = "#111111";
const BORDER_GRAY = "#E0E0E5";

export default function EditProfileModal({
  user, onClose, onSaved,
}: {
  user: AccountUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name,         setName]         = useState(user.name);
  const [email,        setEmail]        = useState(user.email || "");
  const [role,         setRole]         = useState(user.role);
  const [hospitalName, setHospitalName] = useState(user.hospitalName || "");
  const [gender,        setGender]      = useState(user.gender);
  const [age,           setAge]         = useState(String(user.age));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const inputStyle = { border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px", backgroundColor: "#FFFFFF" };

  const handleSave = async () => {
    setError("");
    if (!name.trim())   { setError("Please enter your name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (role === "DOCTOR" && !hospitalName.trim()) { setError("Please enter your hospital name."); return; }
    if (!age || Number(age) <= 0 || Number(age) > 120) { setError("Please enter a valid age."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, hospitalName: role === "DOCTOR" ? hospitalName : null, gender, age: Number(age) }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.user) {
        onSaved();
        onClose();
      } else {
        setError(data.error || "Failed to save. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Failed to save. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-7" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[20px] font-extrabold text-gray-900 mb-5">Edit Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900" style={inputStyle} />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900" style={inputStyle} />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">I am a</label>
            <div className="flex gap-3">
              {(["CUSTOMER", "DOCTOR"] as const).map((r) => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  className="flex-1 py-3 text-[13.5px] font-bold rounded-xl transition-all"
                  style={{
                    border:          `1.5px solid ${role === r ? BLACK : BORDER_GRAY}`,
                    backgroundColor: role === r ? BLACK : "#FFFFFF",
                    color:           role === r ? "#FFFFFF" : "#374151",
                  }}
                >
                  {r === "CUSTOMER" ? "Customer" : "Doctor"}
                </button>
              ))}
            </div>
          </div>

          {role === "DOCTOR" && (
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Hospital Name</label>
              <input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full px-4 py-3 text-[14px] outline-none text-gray-900" style={inputStyle} />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Gender</label>
            <div className="flex gap-5">
              {([["MALE","Male"],["FEMALE","Female"],["OTHER","Others"]] as const).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="edit-gender" checked={gender === val} onChange={() => setGender(val)} className="w-4 h-4" style={{ accentColor: BLACK }} />
                  <span className="text-[13.5px] text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="px-4 py-3 text-[14px] outline-none text-gray-900" style={{ ...inputStyle, width: "120px" }} />
          </div>
        </div>

        {error && <p className="text-[12.5px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full text-[13.5px] font-bold text-gray-700" style={{ border: `1.5px solid ${BORDER_GRAY}` }}>
            Cancel
          </button>
          <button
            type="button" onClick={handleSave} disabled={loading}
            className="flex-1 py-3 rounded-full text-[13.5px] font-bold"
            style={{ background: YELLOW_GRADIENT, color: "#1A1A1A", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

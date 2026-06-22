"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

type Tab  = "new" | "returning";
type Step = "phone" | "otp" | "details";
type Role = "CUSTOMER" | "DOCTOR" | "";
type Gender = "MALE" | "FEMALE" | "OTHER" | "";

export type AuthUser = {
  id: string; name: string; phone: string; role: string;
  hospitalName?: string | null; gender: string; age: number;
};

// Shared design tokens for this modal (kept local since this screen intentionally
// uses a black/yellow/gray palette instead of the site's brand purple/green).
const YELLOW_GRADIENT = "linear-gradient(135deg, #FFD84D 0%, #FFC107 100%)";
const BORDER_GRAY      = "#E0E0E5";
const BLACK            = "#111111";

function PrimaryButton({
  onClick, disabled, loading, loadingText, children,
}: {
  onClick: () => void; disabled?: boolean; loading?: boolean; loadingText: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-opacity"
      style={{
        background: YELLOW_GRADIENT,
        color:      "#1A1A1A",
        opacity:    disabled ? 0.7 : 1,
      }}
    >
      {loading ? <><Loader2 size={17} className="animate-spin" /> {loadingText}</> : children}
    </button>
  );
}

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...value];
    next[i] = val;
    onChange(next);
    if (val && i < value.length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center my-6">
      {value.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className="w-12 h-13 text-center text-[19px] font-bold outline-none text-gray-900"
          style={{ border: `1.5px solid ${BORDER_GRAY}`, borderRadius: "12px", height: "52px" }}
          onFocus={(e) => (e.target.style.borderColor = BLACK)}
          onBlur={(e) => (e.target.style.borderColor = BORDER_GRAY)}
        />
      ))}
    </div>
  );
}

export default function AuthModal({
  open, onClose, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}) {
  const [tab,  setTab]  = useState<Tab>("new");
  const [step, setStep] = useState<Step>("phone");

  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [otp,   setOtp]   = useState<string[]>(Array(6).fill(""));

  const [role,         setRole]         = useState<Role>("");
  const [hospitalName, setHospitalName] = useState("");
  const [gender,       setGender]       = useState<Gender>("");
  const [age,          setAge]          = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const resetAndClose = () => {
    setTab("new"); setStep("phone");
    setName(""); setPhone(""); setOtp(Array(6).fill(""));
    setRole(""); setHospitalName(""); setGender(""); setAge("");
    setError(""); setLoading(false);
    onClose();
  };

  const handleSendOtp = async () => {
    setError("");
    if (tab === "new" && !name.trim()) { setError("Please enter your name."); return; }
    if (phone.length !== 10)           { setError("Please enter a valid 10-digit phone number."); return; }

    setLoading(true);
    // TODO: wire to MSG91 here — request { phone } to actually send an SMS OTP.
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setOtp(Array(6).fill(""));
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.some((d) => d === "")) { setError("Please enter the 6-digit OTP."); return; }

    setLoading(true);
    // TODO: verify the entered OTP with MSG91 here. For now, any 6-digit code is accepted
    // so the rest of the flow (and the data layer below) can be built and tested.
    await new Promise((r) => setTimeout(r, 400));

    if (tab === "returning") {
      try {
        const res  = await fetch(`/api/users?phone=${phone}`);
        const data = await res.json();
        setLoading(false);
        if (data.user) {
          onSuccess?.(data.user);
          resetAndClose();
        } else {
          setError("No account found for this number. Try signing up as a new user instead.");
        }
      } catch {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    } else {
      setLoading(false);
      setStep("details");
    }
  };

  const handleFinish = async () => {
    setError("");
    if (!role)                              { setError("Please select whether you're a customer or doctor."); return; }
    if (role === "DOCTOR" && !hospitalName.trim()) { setError("Please enter your hospital name."); return; }
    if (!gender)                            { setError("Please select your gender."); return; }
    if (!age || Number(age) <= 0 || Number(age) > 120) { setError("Please enter a valid age."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, role,
          hospitalName: role === "DOCTOR" ? hospitalName : null,
          gender, age: Number(age),
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.user) {
        onSuccess?.(data.user);
        resetAndClose();
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  const inputStyle = { border: `1.5px solid ${BORDER_GRAY}`, backgroundColor: "#FFFFFF", borderRadius: "12px" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = BLACK);
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = BORDER_GRAY);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: "rgba(15,23,42,0.55)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />

          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetAndClose}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1,    opacity: 1, y: 0 }}
              exit={{    scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[440px] bg-white overflow-hidden"
              style={{ borderRadius: "24px", boxShadow: "0 25px 60px rgba(0,0,0,0.18)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Step: phone (with New/Returning tabs) ── */}
              {step === "phone" && (
                <>
                  <div className="flex items-center gap-2 px-6 pt-6 pb-1">
                    <button
                      type="button"
                      onClick={() => { setTab("new"); setError(""); }}
                      className="px-6 py-3 text-[14px] font-bold transition-all"
                      style={{
                        backgroundColor: tab === "new" ? BLACK : "transparent",
                        color:           tab === "new" ? "#FFFFFF" : "#9CA3AF",
                        borderRadius:    "16px",
                      }}
                    >
                      New User
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTab("returning"); setError(""); }}
                      className="px-6 py-3 text-[14px] font-bold transition-all"
                      style={{
                        backgroundColor: tab === "returning" ? BLACK : "transparent",
                        color:           tab === "returning" ? "#FFFFFF" : "#9CA3AF",
                        borderRadius:    "16px",
                      }}
                    >
                      Returning User
                    </button>
                  </div>

                  <div className="px-8 py-9">
                    <h2 className="text-[26px] font-extrabold text-gray-900 mb-1.5 leading-tight">
                      {tab === "new" ? "Create account" : "Welcome back"}
                    </h2>
                    <p className="text-[13.5px] text-gray-500 mb-7">
                      {tab === "new"
                        ? "Sign up with your phone number to get started."
                        : "Enter your phone number to continue."}
                    </p>

                    {tab === "new" && (
                      <div className="mb-5">
                        <label className="block text-[12.5px] font-semibold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text" value={name} onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          className="w-full px-4 py-3.5 text-[14px] outline-none text-gray-900 placeholder-gray-400"
                          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                        />
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="block text-[12.5px] font-semibold text-gray-700 mb-2">Mobile Number</label>
                      <div className="flex items-center overflow-hidden" style={inputStyle}>
                        <span className="px-4 py-3.5 text-[14px] font-semibold text-gray-500" style={{ borderRight: `1.5px solid ${BORDER_GRAY}` }}>
                          +91
                        </span>
                        <input
                          type="tel" value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="flex-1 px-3.5 py-3.5 text-[14px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {error && <p className="text-[12.5px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

                    <div className="mt-7">
                      <PrimaryButton onClick={handleSendOtp} disabled={loading} loading={loading} loadingText="Please wait...">
                        Continue
                      </PrimaryButton>
                    </div>

                    <p className="text-[11.5px] text-gray-400 text-center mt-4">
                      We&apos;ll send a verification OTP to your mobile number.
                    </p>
                  </div>
                </>
              )}

              {/* ── Step: OTP ── */}
              {step === "otp" && (
                <div className="px-8 py-9">
                  <h2 className="text-[26px] font-extrabold text-gray-900 mb-1.5 leading-tight">Verify OTP</h2>
                  <p className="text-[13.5px] text-gray-500">
                    Enter the 6-digit code sent to <span className="font-semibold text-gray-700">+91 {phone}</span>
                  </p>

                  <OtpInput value={otp} onChange={setOtp} />

                  {error && <p className="text-[12.5px] text-center mb-3" style={{ color: "#DC2626" }}>{error}</p>}

                  <PrimaryButton onClick={handleVerifyOtp} disabled={loading} loading={loading} loadingText="Verifying...">
                    Continue
                  </PrimaryButton>

                  <p className="text-[11.5px] text-gray-400 text-center mt-4 mb-1">
                    We&apos;ll send a verification OTP to your mobile number.
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <button type="button" onClick={() => { setStep("phone"); setError(""); }} className="text-[12.5px] font-bold" style={{ color: BLACK }}>
                      ← Change number
                    </button>
                    <button type="button" onClick={() => setOtp(Array(6).fill(""))} className="text-[12.5px] font-bold" style={{ color: BLACK }}>
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: details (new signups only) ── */}
              {step === "details" && (
                <div className="px-8 py-9">
                  <h2 className="text-[26px] font-extrabold text-gray-900 mb-1.5 leading-tight">Tell us about yourself</h2>
                  <p className="text-[13.5px] text-gray-500 mb-7">Just a few more details to finish setting up your account.</p>

                  <div className="mb-5">
                    <label className="block text-[12.5px] font-semibold text-gray-700 mb-2.5">
                      I am a <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {(["CUSTOMER", "DOCTOR"] as Role[]).map((r) => (
                        <button
                          key={r} type="button" onClick={() => setRole(r)}
                          className="flex-1 py-3.5 text-[13.5px] font-bold transition-all"
                          style={{
                            border:          `1.5px solid ${role === r ? BLACK : BORDER_GRAY}`,
                            borderRadius:    "12px",
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
                    <div className="mb-5">
                      <label className="block text-[12.5px] font-semibold text-gray-700 mb-2">
                        Hospital Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. Apollo Hospitals"
                        className="w-full px-4 py-3.5 text-[14px] outline-none text-gray-900 placeholder-gray-400"
                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                      />
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="block text-[12.5px] font-semibold text-gray-700 mb-2.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-5">
                      {([["MALE","Male"],["FEMALE","Female"],["OTHER","Others"]] as [Gender, string][]).map(([val, label]) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio" name="gender" checked={gender === val}
                            onChange={() => setGender(val)}
                            className="w-4 h-4" style={{ accentColor: BLACK }}
                          />
                          <span className="text-[13.5px] text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[12.5px] font-semibold text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" value={age} onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full px-4 py-3.5 text-[14px] outline-none text-gray-900 placeholder-gray-400"
                      style={{ ...inputStyle, maxWidth: "150px" }} onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>

                  {error && <p className="text-[12.5px] mt-3" style={{ color: "#DC2626" }}>{error}</p>}

                  <div className="mt-7">
                    <PrimaryButton onClick={handleFinish} disabled={loading} loading={loading} loadingText="Saving...">
                      Finish
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
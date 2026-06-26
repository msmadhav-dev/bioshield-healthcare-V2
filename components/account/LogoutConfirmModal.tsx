"use client";

export default function LogoutConfirmModal({
  open, onCancel, onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15,23,42,0.55)" }} onClick={onCancel}>
      <div
        className="w-full max-w-[360px] bg-white rounded-2xl p-6"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-extrabold text-gray-900 mb-1.5">Log out?</h3>
        <p className="text-[13.5px] text-gray-500 mb-6">Are you sure you want to log out of your account?</p>

        <div className="flex gap-3">
          <button
            type="button" onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13.5px] font-bold text-gray-700"
            style={{ border: "1.5px solid #E0E0E5" }}
          >
            Cancel
          </button>
          <button
            type="button" onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13.5px] font-bold text-white"
            style={{ backgroundColor: "#111111" }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

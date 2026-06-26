"use client";

import { useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import LogoutConfirmModal from "@/components/account/LogoutConfirmModal";
import { AccountProvider, useAccount } from "@/components/account/AccountContext";

function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAccount();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmLogout = async () => {
    await logout();
    setConfirmOpen(false);
    window.location.href = "/shop";
  };

  return (
    <>
      <div className="pt-[100px] md:pt-[68px]" style={{ minHeight: "100vh", backgroundColor: "#F7F7F7" }}>
        <div className="mx-auto px-4 md:px-8 py-6" style={{ maxWidth: "1500px" }}>
          <AccountSidebar onLogoutClick={() => setConfirmOpen(true)} />

          <main className="min-w-0 md:ml-[264px]">
            {loading ? (
              <div className="flex items-center justify-center py-32 text-gray-400 text-[13px]">Loading...</div>
            ) : !user ? (
              <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                <p className="text-[16px] font-bold text-gray-900 mb-1.5">You&apos;re not logged in</p>
                <p className="text-[13.5px] text-gray-500">Use the &quot;Log in&quot; button at the top right to continue.</p>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      <LogoutConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default function AccountPageShell({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <Shell>{children}</Shell>
    </AccountProvider>
  );
}

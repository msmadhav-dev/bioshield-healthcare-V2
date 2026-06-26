"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AccountUser = {
  id: string; name: string; email?: string | null; phone: string; role: string;
  hospitalName?: string | null; gender: string; age: number;
  walletBalance: number; city?: string | null;
};

type AccountContextValue = {
  user:     AccountUser | null;
  loading:  boolean;
  refetch:  () => void;
  logout:   () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(() => {
    setLoading(true);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AccountContext.Provider value={{ user, loading, refetch: fetchMe, logout }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  return ctx;
}

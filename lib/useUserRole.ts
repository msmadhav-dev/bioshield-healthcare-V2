"use client";

import { useEffect, useState } from "react";
import type { Role } from "./pricing";

// Fetches the logged-in user's role once. Defaults to "CUSTOMER" if not
// logged in or still loading, so pricing always has a sane fallback.
export function useUserRole(): Role {
  const [role, setRole] = useState<Role>("CUSTOMER");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user?.role === "DOCTOR") setRole("DOCTOR"); })
      .catch(() => {});
  }, []);

  return role;
}

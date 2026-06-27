"use client";

import { useEffect, useState, useCallback } from "react";

// Fetches the logged-in user's liked product IDs once, and exposes a toggle
// function that does an optimistic update + calls the API. Returns an empty
// set (and a no-op toggle) if not logged in — the heart button still works
// visually, it just won't persist until they log in.
export function useLikedProducts() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/liked")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.likedIds)) setLikedIds(new Set(d.likedIds)); })
      .catch(() => {});
  }, []);

  const toggleLike = useCallback(async (shopProductId: string) => {
    // optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(shopProductId)) next.delete(shopProductId);
      else next.add(shopProductId);
      return next;
    });

    try {
      const res  = await fetch("/api/liked", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ shopProductId }),
      });
      const data = await res.json();
      // reconcile with the server's actual result, in case of a race or error
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(shopProductId);
        else next.delete(shopProductId);
        return next;
      });
    } catch {}
  }, []);

  return { likedIds, toggleLike };
}

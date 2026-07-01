"use client";

import { useEffect, useState, useCallback } from "react";

type CartLine = { id: string; product: { id: string } };

// Fetches the logged-in user's cart once, and exposes add/remove helpers
// with an optimistic update. Removing a line needs the CartItem's own id
// (not the product id), so we track a productId -> cartItemId map alongside
// the id set. Returns an empty set (and no-op handlers) if not logged in —
// the button still works visually, it just won't persist until they log in.
export function useCart() {
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [itemIdByProduct, setItemIdByProduct] = useState<Map<string, string>>(new Map());

  const refresh = useCallback(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d) => {
        const lines: CartLine[] = Array.isArray(d.items) ? d.items : [];
        setCartIds(new Set(lines.map((l) => l.product.id)));
        setItemIdByProduct(new Map(lines.map((l) => [l.product.id, l.id])));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = useCallback(async (shopProductId: string) => {
    setCartIds((prev) => new Set(prev).add(shopProductId));

    try {
      const res  = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ shopProductId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.item) {
        setItemIdByProduct((prev) => new Map(prev).set(shopProductId, data.item.id));
      }
    } catch {}
  }, []);

  const removeFromCart = useCallback(async (shopProductId: string) => {
    const itemId = itemIdByProduct.get(shopProductId);

    setCartIds((prev) => {
      const next = new Set(prev);
      next.delete(shopProductId);
      return next;
    });

    if (!itemId) return;
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    } catch {}
  }, [itemIdByProduct]);

  return { cartIds, addToCart, removeFromCart };
}
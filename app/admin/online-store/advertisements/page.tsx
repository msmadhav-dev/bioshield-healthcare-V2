"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Banner, type Ad } from "@/components/shop/AdvertisementBanners";

export default function AdvertisementsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/advertisements");
      const data = await res.json();
      setAds(data.advertisements || []);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getSlot = (slot: number) => ads.find((item) => item.slot === slot);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Advertisements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the five fixed storefront banner layouts.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="rounded-lg p-2 text-gray-500"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridAutoRows: "260px",
          }}
        >
          <div className="col-span-6 row-span-1 cursor-pointer" onClick={() => router.push("/admin/online-store/advertisements/slot/1")}>
            <Banner ad={getSlot(1)} slot={1} admin />
          </div>

          <div className="col-span-3 row-span-1 cursor-pointer" onClick={() => router.push("/admin/online-store/advertisements/slot/2")}>
            <Banner ad={getSlot(2)} slot={2} admin />
          </div>

          <div className="col-span-3 row-span-2 cursor-pointer" onClick={() => router.push("/admin/online-store/advertisements/slot/3")}>
            <Banner ad={getSlot(3)} slot={3} admin />
          </div>

          <div className="col-span-3 row-span-1 cursor-pointer" onClick={() => router.push("/admin/online-store/advertisements/slot/4")}>
            <Banner ad={getSlot(4)} slot={4} admin />
          </div>

          <div className="col-span-6 row-span-1 cursor-pointer" onClick={() => router.push("/admin/online-store/advertisements/slot/5")}>
            <Banner ad={getSlot(5)} slot={5} admin />
          </div>
        </div>
      )}
    </div>
  );
}
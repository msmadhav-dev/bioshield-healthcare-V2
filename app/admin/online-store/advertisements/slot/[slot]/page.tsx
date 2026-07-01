"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdvertisementForm, {
  type AdvertisementFormValue,
} from "@/components/admin/AdvertisementForm";
import { SLOT_DEFAULT_THEMES } from "@/lib/advertisementThemes";

type ApiAd = AdvertisementFormValue & {
  id: string;
};

export default function AdvertisementSlotPage() {
  const params = useParams<{ slot: string }>();
  const router = useRouter();
  const slot = Number(params.slot) || 1;

  const [loading, setLoading] = useState(true);
  const [adId, setAdId] = useState<string | null>(null);
  const [initialValue, setInitialValue] = useState<AdvertisementFormValue>({
    slot,
    badge: "",
    topCaption: "",
    heading: "",
    productName: "",
    linkUrl: "",
    image: null,
    imageSize: 100,
    imageSizeMobile: 100,
    titleSizeDesktop: 100,
    titleSizeMobile: 100,
    captionSizeDesktop: 100,
    captionSizeMobile: 100,
    buttonSizeDesktop: 100,
    buttonSizeMobile: 100,
    imageOffsetX: 0,
    imageOffsetY: 0,
    imageOffsetXMobile: 0,
    imageOffsetYMobile: 0,
    theme: SLOT_DEFAULT_THEMES[slot] || "orange",
    buttonText: "Buy now",
  });

  useEffect(() => {
    fetch("/api/advertisements")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.advertisements || []).find((item: ApiAd) => item.slot === slot);

        if (found) {
          setAdId(found.id);
          setInitialValue({
            slot: found.slot,
            badge: found.badge || "",
            topCaption: found.topCaption || "",
            heading: found.heading || "",
            productName: found.productName || "",
            linkUrl: found.linkUrl || "",
            image: found.image || null,
            imageSize: found.imageSize ?? 100,
            imageSizeMobile: found.imageSizeMobile ?? 100,
            titleSizeDesktop: found.titleSizeDesktop ?? 100,
            titleSizeMobile: found.titleSizeMobile ?? 100,
            captionSizeDesktop: found.captionSizeDesktop ?? 100,
            captionSizeMobile: found.captionSizeMobile ?? 100,
            buttonSizeDesktop: found.buttonSizeDesktop ?? 100,
            buttonSizeMobile: found.buttonSizeMobile ?? 100,
            imageOffsetX: found.imageOffsetX || 0,
            imageOffsetY: found.imageOffsetY || 0,
            imageOffsetXMobile: found.imageOffsetXMobile || 0,
            imageOffsetYMobile: found.imageOffsetYMobile || 0,
            theme: found.theme || SLOT_DEFAULT_THEMES[slot] || "orange",
            buttonText: found.buttonText || "Buy now",
          });
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slot]);

  async function handleSave(value: AdvertisementFormValue) {
    const url = adId ? `/api/advertisements/${adId}` : "/api/advertisements";
    const method = adId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save advertisement");

    setTimeout(() => {
      router.push("/admin/online-store/advertisements");
    }, 600);
  }

  async function handleDelete() {
    if (!adId) return;

    const res = await fetch(`/api/advertisements/${adId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete advertisement");

    router.push("/admin/online-store/advertisements");
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <AdvertisementForm
      title={`Edit Advertisement Slot ${slot}`}
      submitLabel="Save Advertisement"
      initialValue={initialValue}
      lockSlot
      onSubmit={handleSave}
      onDelete={adId ? handleDelete : undefined}
    />
  );
}
"use client";

import { useRouter } from "next/navigation";
import AdvertisementForm, {
  type AdvertisementFormValue,
} from "@/components/admin/AdvertisementForm";
import { SLOT_DEFAULT_THEMES } from "@/lib/advertisementThemes";

export default function AddAdvertisementPage() {
  const router = useRouter();

  async function handleSave(value: AdvertisementFormValue) {
    const res = await fetch("/api/advertisements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create advertisement");

    setTimeout(() => {
      router.push("/admin/online-store/advertisements");
    }, 600);
  }

  return (
    <AdvertisementForm
      title="Add Advertisement"
      submitLabel="Add Advertisement"
      initialValue={{
        slot: 1,
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
        theme: SLOT_DEFAULT_THEMES[1],
        buttonText: "Buy now",
      }}
      onSubmit={handleSave}
    />
  );
}
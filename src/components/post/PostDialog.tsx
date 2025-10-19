"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import PostFormFields from "./PostFormFields";
import type { MoodType, PostFormData, PostDialogProps, PlaceOption } from "@/lib/post-types";

const DEFAULT_PLACE_PARAMS = {
  lat: 35.6812,
  lng: 139.7671,
  radius: 5000,
};

export default function PostDialog({
  isOpen,
  onClose,
  onSubmit,
}: PostDialogProps) {
  const [formData, setFormData] = useState<PostFormData>({
    placeId: null,
    spotName: "",
    mood: null,
    text: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [places, setPlaces] = useState<PlaceOption[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // ダイアログが開いているときはbodyのスクロールを禁止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

    let cancelled = false;
    const fetchPlaces = async () => {
      setPlacesLoading(true);
      setPlacesError(null);
      try {
        const params = new URLSearchParams({
          lat: DEFAULT_PLACE_PARAMS.lat.toString(),
          lng: DEFAULT_PLACE_PARAMS.lng.toString(),
          radius: DEFAULT_PLACE_PARAMS.radius.toString(),
        });
        const response = await fetch(`/api/places?${params.toString()}`);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.error || "場所の取得に失敗しました");
        }
        const body = await response.json();
        const options: PlaceOption[] = Array.isArray(body?.data)
          ? body.data.map((place: { id: number | string; name: string }) => ({
              id: place.id.toString(),
              name: place.name,
            }))
          : [];
        if (!cancelled) {
          setPlaces(options);
          setFormData((prev) => {
            if (
              prev.placeId &&
              options.some((option) => option.id === prev.placeId)
            ) {
              return prev;
            }
            return {
              ...prev,
              placeId: null,
              spotName: "",
            };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setPlacesError(
            error instanceof Error ? error.message : "場所の取得に失敗しました",
          );
        }
      } finally {
        if (!cancelled) {
          setPlacesLoading(false);
        }
      }
    };

    void fetchPlaces();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 60) {
      setFormData((prev) => ({ ...prev, text }));
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleImageSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handlePlaceSelect = (placeId: string | null) => {
    if (!placeId) {
      setFormData((prev) => ({ ...prev, placeId: null, spotName: "" }));
      return;
    }
    const target = places.find((place) => place.id === placeId);
    setFormData((prev) => ({
      ...prev,
      placeId,
      spotName: target?.name ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placeId || !formData.mood || !formData.text.trim()) {
      alert("スポット、気分、テキストは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // リセット
      setFormData({
        placeId: null,
        spotName: "",
        mood: null,
        text: "",
        image: null,
      });
      onClose();
    } catch (error) {
      console.error("投稿エラー:", error);
      const message =
        error instanceof Error ? error.message : "投稿に失敗しました";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* バックドロップ */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* PC: 中央オーバーレイダイアログ */}
      <dialog
        className="
          hidden lg:flex fixed lg:inset-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 
          lg:w-full lg:max-w-md lg:rounded-xl lg:shadow-2xl lg:flex-col
          z-50 bg-white outline-none lg:max-h-[90vh] lg:overflow-y-auto
        "
        open={isOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">スポットを投稿</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <PostFormFields
          formData={formData}
          isSubmitting={isSubmitting}
          places={places}
          placesLoading={placesLoading}
          placesError={placesError}
          onPlaceSelect={handlePlaceSelect}
          onTextChange={handleTextChange}
          onMoodSelect={handleMoodSelect}
          onImageSelect={handleImageSelect}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </dialog>

      {/* モバイル・タブレット: 下部シート */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="postSheetTitle"
        className="
          fixed bottom-0 left-0 right-0 lg:hidden md:left-20
          bg-white rounded-t-2xl shadow-2xl z-50
          animate-in slide-in-from-bottom-4
          max-h-[90vh] overflow-y-auto
        "
      >
        <div
          id="postSheetTitle"
          className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl"
        >
          <h2 className="text-lg font-bold text-slate-900">スポットを投稿</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-4 pb-8">
          <PostFormFields
            formData={formData}
            isSubmitting={isSubmitting}
            places={places}
            placesLoading={placesLoading}
            placesError={placesError}
            onPlaceSelect={handlePlaceSelect}
            onTextChange={handleTextChange}
            onMoodSelect={handleMoodSelect}
            onImageSelect={handleImageSelect}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
}

"use client";

import type { MoodType, PostDialogProps, PostFormData } from "@/lib/post-types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import PostFormFields from "./PostFormFields";
import { getCurrentLocation } from "@/lib/geolocation";

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
    location: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ダイアログが開いているときは body スクロールを禁止
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

  const handleSpotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      placeId: value,
      spotName: value,
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comment = formData.text.trim();
    if (!formData.placeId || !formData.mood || !comment) {
      alert("スポット、気分、テキストは必須です");
      return;
    }

    const placeInput = formData.placeId?.trim();
    const spotName = formData.spotName.trim();
    if (!placeInput) {
      alert("スポット名を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentLocation = await getCurrentLocation();

      await onSubmit({
        ...formData,
        placeId: placeInput,
        spotName: spotName || placeInput,
        text: comment,
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          name: spotName || undefined,
        },
      });
      setFormData({
        placeId: null,
        spotName: "",
        mood: null,
        text: "",
        image: null,
        location: null,
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
        className="fixed inset-0 bg-white/20 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* PC: 中央オーバーレイダイアログ */}
      <dialog
        className="
          hidden md:flex fixed md:inset-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
          md:w-full md:max-w-md md:rounded-xl md:shadow-2xl md:flex-col
          z-[9999] bg-white outline-none
          md:max-h-[90vh] md:overflow-y-auto
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
          onSpotNameChange={handleSpotNameChange}
          isSubmitting={isSubmitting}
          onTextChange={handleTextChange}
          onMoodSelect={handleMoodSelect}
          onImageSelect={handleImageSelect}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </dialog>

      {/* モバイル: 下部シート */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="postSheetTitle"
        className="
          fixed bottom-0 left-0 right-0 md:hidden
          bg-white rounded-t-2xl shadow-2xl z-[9999]
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
            onSpotNameChange={handleSpotNameChange}
            isSubmitting={isSubmitting}
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

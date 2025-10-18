"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Mood, PostFormData } from "./types";
import PostFormFields from "./PostFormFields";
interface PostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: PostFormData) => Promise<void>;
}

export default function PostDialog({
  isOpen,
  onClose,
  onSubmit,
}: PostDialogProps) {
  const [formData, setFormData] = useState<PostFormData>({
    spotName: "",
    mood: null,
    text: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSpotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, spotName: e.target.value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 60) {
      setFormData((prev) => ({ ...prev, text }));
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleImageSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.spotName.trim() || !formData.mood || !formData.text.trim()) {
      alert("スポット名、気分、テキストは必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      // リセット
      setFormData({ spotName: "", mood: null, text: "", image: null });
      onClose();
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* バックドロップ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* PC: 中央オーバーレイダイアログ */}
      <dialog
        className="
          hidden md:flex fixed md:inset-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
          md:w-full md:max-w-md md:rounded-xl md:shadow-2xl md:flex-col
          z-50 bg-white outline-none
        "
        open={isOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">スポットを投稿</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <PostFormFields
          formData={formData}
          isSubmitting={isSubmitting}
          onSpotNameChange={handleSpotNameChange}
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
            onSpotNameChange={handleSpotNameChange}
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

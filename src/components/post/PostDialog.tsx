"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Mood, PostFormData } from "./types";
import MoodSelector from "./MoodSelector";
import ImageUpload from "./ImageUpload";

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

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 p-4 gap-4"
        >
          {/* スポット名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              スポット名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.spotName}
              onChange={handleSpotNameChange}
              placeholder="例: 〇〇カフェ、xx図書館"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 気分選択 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              気分を選択 <span className="text-red-500">*</span>
            </label>
            <MoodSelector
              selectedMood={formData.mood}
              onMoodSelect={handleMoodSelect}
            />
          </div>

          {/* テキスト */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              コメント <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-slate-500">
                {formData.text.length}/60
              </span>
            </label>
            <textarea
              value={formData.text}
              onChange={handleTextChange}
              placeholder="この場所のおすすめポイント、雰囲気など"
              maxLength={60}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              写真 <span className="text-xs text-slate-500">(任意)</span>
            </label>
            <ImageUpload
              selectedImage={formData.image}
              onImageSelect={handleImageSelect}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </button>
          </div>
        </form>
      </dialog>

      {/* モバイル: 下部シート */}
      <div
        className="
          fixed bottom-0 left-0 right-0 md:hidden
          bg-white rounded-t-2xl shadow-2xl z-50
          animate-in slide-in-from-bottom-4
          max-h-[90vh] overflow-y-auto
        "
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">スポットを投稿</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-4 pb-8">
          {/* スポット名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              スポット名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.spotName}
              onChange={handleSpotNameChange}
              placeholder="例: 〇〇カフェ、xx図書館"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 気分選択 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              気分を選択 <span className="text-red-500">*</span>
            </label>
            <MoodSelector
              selectedMood={formData.mood}
              onMoodSelect={handleMoodSelect}
            />
          </div>

          {/* テキスト */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              コメント <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-slate-500">
                {formData.text.length}/60
              </span>
            </label>
            <textarea
              value={formData.text}
              onChange={handleTextChange}
              placeholder="この場所のおすすめポイント、雰囲気など"
              maxLength={60}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              写真 <span className="text-xs text-slate-500">(任意)</span>
            </label>
            <ImageUpload
              selectedImage={formData.image}
              onImageSelect={handleImageSelect}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "投稿中..." : "投稿"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

"use client";

import type { Mood, PostFormData } from "./types";
import MoodSelector from "./MoodSelector";
import ImageUpload from "./ImageUpload";

const MAX_COMMENT_LENGTH = 60;

interface PostFormFieldsProps {
  formData: PostFormData;
  isSubmitting: boolean;
  onSpotNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMoodSelect: (mood: Mood) => void;
  onImageSelect: (file: File | null) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PostFormFields({
  formData,
  isSubmitting,
  onSpotNameChange,
  onTextChange,
  onMoodSelect,
  onImageSelect,
  onCancel,
  onSubmit,
}: PostFormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 p-4 gap-4">
      {/* スポット名 */}
      <div>
        <label
          htmlFor="spotName"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          スポット名 <span className="text-red-500">*</span>
        </label>
        <input
          id="spotName"
          type="text"
          value={formData.spotName}
          onChange={onSpotNameChange}
          placeholder="例: 〇〇カフェ、xx公園の東ベンチ"
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
          onMoodSelect={onMoodSelect}
        />
      </div>

      {/* テキスト */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          コメント <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-slate-500">
            {formData.text.length}/{MAX_COMMENT_LENGTH}
          </span>
        </label>
        <textarea
          id="comment"
          value={formData.text}
          onChange={onTextChange}
          placeholder="この場所のおすすめポイント、雰囲気など"
          maxLength={MAX_COMMENT_LENGTH}
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
          onImageSelect={onImageSelect}
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
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
  );
}

"use client";

import ImageUpload from "./ImageUpload";
import MoodSelector from "./MoodSelector";
import type { MoodType, PostFormFieldsProps } from "@/lib/post-types";

const MAX_COMMENT_LENGTH = 60;

export default function PostFormFields({
  formData,
  isSubmitting,
  places,
  placesLoading,
  placesError,
  onPlaceSelect,
  onTextChange,
  onMoodSelect,
  onImageSelect,
  onCancel,
  onSubmit,
}: PostFormFieldsProps) {
  const handlePlaceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    onPlaceSelect(value ? value : null);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 p-4 gap-4">
      {/* スポット名 */}
      <div>
        <label
          htmlFor="placeId"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          スポット名 <span className="text-red-500">*</span>
        </label>
        <select
          id="placeId"
          value={formData.placeId ?? ""}
          onChange={handlePlaceChange}
          disabled={placesLoading || isSubmitting || places.length === 0}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        >
          <option value="">スポットを選択してください</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name}
            </option>
          ))}
        </select>
        {placesLoading && (
          <p className="mt-1 text-xs text-slate-500">スポットを読み込み中...</p>
        )}
        {placesError && (
          <p className="mt-1 text-xs text-red-600">{placesError}</p>
        )}
      </div>

      {/* 気分選択 */}
      <div>
        <p className="block text-sm font-medium text-slate-700 mb-2">
          気分を選択 <span className="text-red-500">*</span>
        </p>
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
        <p className="block text-sm font-medium text-slate-700 mb-2">
          写真 <span className="text-xs text-slate-500">(任意)</span>
        </p>
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

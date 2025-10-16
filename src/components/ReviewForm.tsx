'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/stores/appStore';
import { ReviewFormData, Review } from '@/types';
import { format } from 'date-fns';

const reviewSchema = z.object({
  spotId: z.string().min(1, 'スポットを選択してください'),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, 'レビューは10文字以上で入力してください'),
  mood: z.enum(['productive', 'creative', 'focused', 'relaxed', 'social']),
  tags: z.array(z.string()).min(1, '少なくとも1つのタグを入力してください'),
  visitDate: z.date(),
});

interface ReviewFormProps {
  spotId?: string;
  onClose?: () => void;
}

export default function ReviewForm({ spotId, onClose }: ReviewFormProps) {
  const { spots, addReview, currentUser } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      spotId: spotId || '',
      rating: 5,
      content: '',
      mood: 'productive',
      tags: [],
      visitDate: new Date(),
    },
  });

  const selectedSpotId = watch('spotId');
  const selectedMood = watch('mood');
  const tagInput = watch('tags');

  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const newTag = input.value.trim();

      if (newTag && !tagInput.includes(newTag)) {
        setValue('tags', [...tagInput, newTag]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tagInput.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      const newReview: Review = {
        id: Date.now().toString(),
        userId: currentUser.id,
        user: currentUser,
        spotId: data.spotId,
        spot: selectedSpot!,
        rating: data.rating,
        content: data.content,
        mood: data.mood,
        tags: data.tags,
        visitDate: data.visitDate,
        createdAt: new Date(),
        helpful: 0,
      };

      addReview(newReview);
      reset();
      onClose?.();
    } catch (error) {
      console.error('レビュー投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { value: 'productive', label: '生産的', emoji: '⚡' },
    { value: 'creative', label: '創造的', emoji: '💡' },
    { value: 'focused', label: '集中', emoji: '🎯' },
    { value: 'relaxed', label: 'リラックス', emoji: '😌' },
    { value: 'social', label: '社交的', emoji: '👥' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">レビュー投稿</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* スポット選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スポット選択 *
          </label>
          <select
            {...register('spotId')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">スポットを選択してください</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name} ({spot.category})
              </option>
            ))}
          </select>
          {errors.spotId && (
            <p className="text-red-500 text-sm mt-1">{errors.spotId.message}</p>
          )}
        </div>

        {/* 評価 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            評価 *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue('rating', star)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {star <= (watch('rating') || 0) ? '★' : '☆'}
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* 気分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            気分 *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setValue('mood', mood.value as any)}
                className={`p-2 rounded-md border text-sm ${
                  selectedMood === mood.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
          {errors.mood && (
            <p className="text-red-500 text-sm mt-1">{errors.mood.message}</p>
          )}
        </div>

        {/* 訪問日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            訪問日
          </label>
          <input
            type="date"
            {...register('visitDate', {
              valueAsDate: true,
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* レビュー内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            レビュー内容 *
          </label>
          <textarea
            {...register('content')}
            rows={4}
            placeholder="この場所での体験を詳しく書いてください..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ *
          </label>
          <input
            type="text"
            placeholder="タグを入力（Enterまたはカンマで追加）"
            onKeyDown={handleAddTag}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {tagInput.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tagInput.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '投稿中...' : 'レビューを投稿'}
        </button>
      </form>
    </div>
  );
}

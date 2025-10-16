'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/appStore';
import { Review, Spot } from '@/types';

// クライアントサイドでのみレンダリングするよう動的インポート
const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">地図を読み込み中...</div>
});

// カスタムレビューマーカーアイコンを作成
const createReviewIcon = (review: Review) => {
  const moodColors = {
    productive: '#10B981', // green
    creative: '#F59E0B',   // yellow
    focused: '#3B82F6',    // blue
    relaxed: '#8B5CF6',    // purple
    social: '#EF4444',     // red
  };

  const color = moodColors[review.mood];

  return new DivIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        ${review.rating}
      </div>
    `,
    className: 'custom-review-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// スポットマーカーアイコンを作成
const createSpotIcon = (spot: Spot) => {
  const categoryIcons = {
    cafe: '☕',
    park: '🌳',
    library: '📚',
    coworking: '💼',
    beach: '🏖️',
    other: '📍',
  };

  return new DivIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: white;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ${categoryIcons[spot.category]}
      </div>
    `,
    className: 'custom-spot-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// マップビューポート変更を処理するコンポーネント
function MapController() {
  const mapViewport = useAppStore((state) => state.mapViewport);

  const map = useMap();

  useEffect(() => {
    map.setView(mapViewport.center, mapViewport.zoom);
  }, [map, mapViewport]);

  return null;
}

// レビューカードコンポーネント
function ReviewCard({ review }: { review: Review }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const moodLabels = {
    productive: '生産的',
    creative: '創造的',
    focused: '集中',
    relaxed: 'リラックス',
    social: '社交的',
  };

  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={review.user.avatar}
          alt={review.user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <p className="font-medium text-sm">{review.user.name}</p>
          <p className="text-xs text-gray-500">
            {formatDate(review.visitDate)} • {moodLabels[review.mood]}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium">{review.rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{review.content}</p>
      <div className="flex flex-wrap gap-1">
        {review.tags.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

interface MapProps {
  reviews?: Review[];
  spots?: Spot[];
  height?: string;
  showReviews?: boolean;
  showSpots?: boolean;
}

export default function Map({
  reviews = [],
  spots = [],
  height = '300px',
  showReviews = true,
  showSpots = true,
}: MapProps) {
  // 表示するレビューとスポットを取得
  const displayReviews = reviews.length > 0 ? reviews : [];
  const displaySpots = spots.length > 0 ? spots : [];

  const handleMoveEnd = (e: any) => {
    // イベント処理はDynamicMap内で処理されるため、ここでは何もしない
  };

  return (
    <div className="w-full" style={{ height }}>
      <DynamicMap
        reviews={displayReviews}
        spots={displaySpots}
        height={height}
        showReviews={showReviews}
        showSpots={showSpots}
        onMoveEnd={handleMoveEnd}
      />
    </div>
  );
}

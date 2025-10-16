'use client';

import { useAppStore } from '@/stores/appStore';
import Map from '@/components/Map';
import ReviewForm from '@/components/ReviewForm';
import { useState } from 'react';

export default function Home() {
  const { reviews, spots, selectedSpot, getFilteredSpots, getReviewsForSpot, getRecommendedSpots } = useAppStore();
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const filteredSpots = getFilteredSpots();
  const spotReviews = selectedSpot ? getReviewsForSpot(selectedSpot.id) : [];
  const recommendedSpots = getRecommendedSpots(3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">WorkScape</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium"
              >
                レビュー投稿
              </button>
              <p className="text-sm text-gray-600">作業場所発見アプリ</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* タブナビゲーション */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'map'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🗺️ マップ
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 スポット一覧
          </button>
        </div>

        {/* マップビュー */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border p-3">
                <h2 className="text-lg font-semibold mb-3">作業スポットマップ</h2>
                <Map height="350px" />
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* 選択中のスポット情報 */}
              {selectedSpot && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-3">{selectedSpot.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedSpot.address}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">{selectedSpot.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({selectedSpot.totalReviews}件のレビュー)
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{selectedSpot.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSpot.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* レビューリスト */}
              {selectedSpot && spotReviews.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-3">レビュー</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {spotReviews.map((review) => (
                      <div key={review.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium">{review.user.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.content}</p>
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* リストビュー */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* おすすめスポット */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4">おすすめスポット</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpots.map((spot) => (
                  <div key={spot.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {spot.category === 'cafe' && '☕'}
                        {spot.category === 'park' && '🌳'}
                        {spot.category === 'library' && '📚'}
                        {spot.category === 'coworking' && '💼'}
                        {spot.category === 'beach' && '🏖️'}
                        {spot.category === 'other' && '📍'}
                      </span>
                      <h3 className="font-semibold">{spot.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{spot.address}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{spot.averageRating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({spot.totalReviews}件のレビュー)
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{spot.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {spot.amenities.slice(0, 2).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* あなたにおすすめ */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold mb-4">あなたにおすすめ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedSpots.map((spot) => (
                  <div key={spot.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {spot.category === 'cafe' && '☕'}
                        {spot.category === 'park' && '🌳'}
                        {spot.category === 'library' && '📚'}
                        {spot.category === 'coworking' && '💼'}
                        {spot.category === 'beach' && '🏖️'}
                        {spot.category === 'other' && '📍'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{spot.name}</h3>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          おすすめ
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{spot.address}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{spot.averageRating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({spot.totalReviews}件のレビュー)
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{spot.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {spot.amenities.slice(0, 2).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* レビュー投稿モーダル */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm onClose={() => setShowReviewForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

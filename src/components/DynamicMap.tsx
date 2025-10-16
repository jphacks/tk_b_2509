'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { useAppStore } from '@/stores/appStore';
import { Review, Spot } from '@/types';

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

interface DynamicMapProps {
  reviews: Review[];
  spots: Spot[];
  height: string;
  showReviews: boolean;
  showSpots: boolean;
  onMoveEnd: (e: any) => void;
}

export default function DynamicMap({
  reviews,
  spots,
  height,
  showReviews,
  showSpots,
  onMoveEnd,
}: DynamicMapProps) {
  const mapViewport = useAppStore((state) => state.mapViewport);
  const setSelectedSpot = useAppStore((state) => state.setSelectedSpot);
  const setMapViewport = useAppStore((state) => state.setMapViewport);

  // Leafletのデフォルトマーカーを修正（クライアントサイドのみ）
  useEffect(() => {
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // マップ移動イベントを処理する内部コンポーネント
  function MapEventHandler() {
    const map = useMap();

    useEffect(() => {
      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setMapViewport({
          center: [center.lat, center.lng],
          zoom,
        });
        onMoveEnd({ target: map });
      };

      map.on('moveend', handleMoveEnd);
      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }, [map, setMapViewport, onMoveEnd]);

    return null;
  }

  // マップの境界を定義（渋谷駅中心部の狭い正方形領域）
  const mapBounds: [[number, number], [number, number]] = [
    [35.657, 139.698],  // 南西（渋谷駅中心部）
    [35.661, 139.702]   // 北東（渋谷駅中心部）
  ];

  return (
    <MapContainer
      center={mapViewport.center}
      zoom={mapViewport.zoom}
      style={{ height: '100%', width: '100%' }}
      maxBounds={mapBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController />
      <MapEventHandler />

      {/* レビューマーカーを表示 */}
      {showReviews &&
        reviews.map((review) => (
          <Marker
            key={review.id}
            position={[review.spot.coordinates.lat, review.spot.coordinates.lng]}
            icon={createReviewIcon(review)}
          >
            <Popup>
              <ReviewCard review={review} />
            </Popup>
          </Marker>
        ))}

        {/* スポットマーカーを表示 */}
        {showSpots &&
          spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.coordinates.lat, spot.coordinates.lng]}
              icon={createSpotIcon(spot)}
            >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-base mb-1">{spot.name}</h3>
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
                <p className="text-sm text-gray-700 mb-2">{spot.description}</p>
                <div className="flex flex-wrap gap-1">
                  {spot.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

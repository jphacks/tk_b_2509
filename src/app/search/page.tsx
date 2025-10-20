"use client";

import { GoogleMap } from "../../components/Map/GoogleMap";
import type { MapPin } from "@/lib/map-types";
import { fetchPosts } from "@/lib/feed";
import { getRandomSortKey } from "@/lib/feed";
import type { SortKey } from "@/lib/feed-types";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.7674 });
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const selectedLocation = useMemo(() => {
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    if (!latParam || !lngParam) {
      return null;
    }

    const lat = Number.parseFloat(latParam);
    const lng = Number.parseFloat(lngParam);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    const placeName = searchParams.get("place") ?? "選択したスポット";
    const postId = searchParams.get("postId") ?? undefined;

    return {
      lat,
      lng,
      placeName,
      postId,
    };
  }, [searchParams]);

  useEffect(() => {
    const highlightPin = selectedLocation
      ? ({
          id:
            selectedLocation.postId ??
            `selected-${selectedLocation.lat}-${selectedLocation.lng}`,
          position: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          },
          content: (
            <div className="text-sm">
              <h3 className="font-semibold mb-1">
                {selectedLocation.placeName}
              </h3>
              <p className="text-gray-600">フィードで選択したスポット</p>
            </div>
          ),
        } satisfies MapPin)
      : null;

    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // ランダムなソートキーで投稿を取得
        const sortKey = getRandomSortKey() as SortKey;
        const response = await fetchPosts(sortKey, 20); // 最初の20件を取得

        // 投稿データを MapPin 形式に変換
        const mapPins: MapPin[] = response.posts.map((post) => {
          // コメントが長い場合は省略
          const maxLength = 100;
          const truncatedContent =
            post.contents.length > maxLength
              ? `${post.contents.substring(0, maxLength)}…`
              : post.contents;

          return {
            id: post.id.toString(),
            position: { lat: post.latitude, lng: post.longitude },
            content: (
              <div className="text-sm">
                <h3 className="font-semibold mb-1">{post.placeName}</h3>
                <p className="text-gray-600">{truncatedContent}</p>
              </div>
            ),
          };
        });

        let updatedPins = mapPins;

        if (highlightPin) {
          const hasDuplicate = mapPins.some(
            (pin) =>
              pin.position.lat === highlightPin.position.lat &&
              pin.position.lng === highlightPin.position.lng,
          );

          updatedPins = hasDuplicate ? mapPins : [highlightPin, ...mapPins];
          setCenter(highlightPin.position);
        } else if (mapPins.length > 0 && response.posts[0]) {
          setCenter({
            lat: response.posts[0].latitude,
            lng: response.posts[0].longitude,
          });
        }

        setPins(updatedPins);
      } catch (error) {
        console.error("Failed to load posts:", error);
        if (highlightPin) {
          setPins([highlightPin]);
          setCenter(highlightPin.position);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700">地図を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <GoogleMap center={center} zoom={15} pins={pins} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">地図を読み込み中...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

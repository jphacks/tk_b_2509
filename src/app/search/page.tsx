"use client";

import { GoogleMap } from "../../components/Map/GoogleMap";
import type { MapPin } from "@/lib/map-types";
import { fetchPosts } from "@/lib/feed";
import { getRandomSortKey } from "@/lib/feed";
import type { SortKey } from "@/lib/feed-types";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.7674 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
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

        setPins(mapPins);

        // 最初の投稿の位置をセンターに設定（投稿がある場合）
        if (mapPins.length > 0 && response.posts[0]) {
          setCenter({
            lat: response.posts[0].latitude,
            lng: response.posts[0].longitude,
          });
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

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

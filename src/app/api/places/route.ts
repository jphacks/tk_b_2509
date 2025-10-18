import { type NextRequest, NextResponse } from "next/server";
import { SpatialQueries, SpatialUtils } from "@/lib/spatial";

/**
 * 場所検索API
 * GET /api/places?lat=35.658034&lng=139.701636&radius=1000
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("lat") || "");
    const longitude = parseFloat(searchParams.get("lng") || "");
    const radiusStr = searchParams.get("radius");
    const radius = radiusStr ? parseInt(radiusStr, 10) : 1000; // デフォルト1km

    // パラメータの検証
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: "緯度と経度を正しく指定してください" },
        { status: 400 },
      );
    }

    if (Number.isNaN(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "検索半径を正しく指定してください" },
        { status: 400 },
      );
    }

    // 空間クエリを実行
    const places = await SpatialQueries.findPlacesWithinRadius(
      longitude,
      latitude,
      radius,
      50, // 最大50件
    );

    // 結果をフォーマット
    const formattedPlaces = places.map((place) => ({
      id: place.id,
      name: place.name,
      place_id: place.placeId,
      location: place.location,
      distance:
        place.distanceMeters !== undefined
          ? SpatialUtils.formatDistance(place.distanceMeters)
          : undefined,
    }));

    return NextResponse.json({
      success: true,
      count: formattedPlaces.length,
      data: formattedPlaces,
    });
  } catch (error) {
    console.error("場所検索エラー:", error);
    return NextResponse.json(
      { error: "場所検索に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * 場所作成API
 * POST /api/places
 * {
 *   "name": "東京駅",
 *   "longitude": 139.7673068,
 *   "latitude": 35.6812362,
 *   "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4" // 任意
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, longitude, latitude, placeId } = body;

    // パラメータの検証
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "場所名を正しく指定してください" },
        { status: 400 },
      );
    }

    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return NextResponse.json(
        { error: "経度と緯度を数値で指定してください" },
        { status: 400 },
      );
    }

    // 座標の有効範囲チェック
    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        { error: "経度・緯度の範囲が不正です" },
        { status: 400 },
      );
    }

    // 場所を作成
    const place = await SpatialQueries.createPlace(
      name,
      longitude,
      latitude,
      placeId,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: place.id,
          name: place.name,
          place_id: place.placeId,
          location: place.location,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("場所作成エラー:", error);
    return NextResponse.json(
      { error: "場所作成に失敗しました" },
      { status: 500 },
    );
  }
}

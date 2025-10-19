import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import {
  ALLOWED_MOOD_TYPES,
  type CreatePostRequestBody,
  type MoodType,
  type ParsedCreatePostBody,
  type ParsedCreatePostBodyWithLocation,
  REQUIRED_CREATE_POST_FIELDS,
} from "@/lib/post-types";
import { SpatialQueries } from "@/lib/spatial";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function parseBigIntId(value: unknown): bigint | null {
  if (typeof value === "bigint") {
    return value >= 0n ? value : null;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      return null;
    }
    return BigInt(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    try {
      return BigInt(trimmed);
    } catch (_error) {
      return null;
    }
  }
  return null;
}

function validateRequestBody(
  body: CreatePostRequestBody,
): ParsedCreatePostBody | ParsedCreatePostBodyWithLocation | null {
  // 共通の必須フィールド検証
  const requiredFields: Array<keyof CreatePostRequestBody> = ["moodType", "contents"];
  const missingField = requiredFields.find(
    (field) => body[field] === undefined,
  );
  if (missingField) {
    return null;
  }

  const moodTypeInput =
    typeof body.moodType === "string" ? body.moodType.trim() : "";
  const moodType = ALLOWED_MOOD_TYPES.find(
    (value) => value === moodTypeInput,
  ) as MoodType | undefined;
  const contents =
    typeof body.contents === "string" ? body.contents.trim() : "";

  if (!moodType || !contents) {
    return null;
  }

  if (contents.length > 10_000) {
    return null;
  }

  let imageUrl: string | null = null;
  if (body.imageUrl !== undefined && body.imageUrl !== null) {
    if (typeof body.imageUrl !== "string") {
      return null;
    }
    const trimmed = body.imageUrl.trim();
    if (trimmed.length === 0) {
      imageUrl = null;
    } else {
      imageUrl = trimmed;
    }
  }

  // placeIdが提供された場合の従来の検証
  if (body.placeId !== undefined) {
    const placeId = parseBigIntId(body.placeId);
    if (placeId === null) {
      return null;
    }
    return {
      moodType,
      contents,
      placeId,
      imageUrl,
    };
  }

  // locationが提供された場合の検証
  if (body.location !== undefined) {
    if (
      typeof body.location !== "object" ||
      body.location === null ||
      typeof body.location.latitude !== "number" ||
      typeof body.location.longitude !== "number"
    ) {
      return null;
    }

    const { latitude, longitude, name } = body.location;

    // 緯度経度の有効範囲チェック
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return null;
    }

    return {
      moodType,
      contents,
      location: {
        latitude,
        longitude,
        name: typeof name === "string" ? name.trim() : undefined,
      },
      imageUrl,
    };
  }

  // placeIdもlocationも提供されていない場合はエラー
  return null;
}

function generateRandomKeys(): [number, number, number, number, number] {
  return [
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
  ];
}

/**
 * 投稿作成API
 * POST /api/post/createPost
 * 認証必須（Cookie もしくは Authorization ヘッダー）
 *
 * リクエスト例（placeId指定）:
 * ```json
 * {
 *   "moodType": "relax",
 *   "contents": "今日は素敵なカフェを見つけました！",
 *   "placeId": "12345",
 *   "imageUrl": "https://example.com/photo.jpg"
 * }
 * ```
 *
 * リクエスト例（現在地から自動作成）:
 * ```json
 * {
 *   "moodType": "relax",
 *   "contents": "今日は素敵なカフェを見つけました！",
 *   "location": {
 *     "latitude": 35.6812,
 *     "longitude": 139.7671,
 *     "name": "東京駅周辺"
 *   },
 *   "imageUrl": "https://example.com/photo.jpg"
 * }
 * ```
 *
 * 成功時レスポンス例:
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "id": "67890",
 *     "moodType": "relax",
 *     "contents": "今日は素敵なカフェを見つけました！",
 *     "imageUrl": "https://example.com/photo.jpg",
 *     "placeId": "12345",
 *     "placeName": "東京駅周辺",
 *     "reactionCount": 0,
 *     "author": {
 *       "name": "Kevin",
 *       "avatar": null
 *     },
 *     "postedAt": "2024-01-01T12:34:56.000Z"
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(authResult.error, { status: 401 });
  }

  let requestBody: CreatePostRequestBody;
  try {
    requestBody = (await request.json()) as CreatePostRequestBody;
  } catch (_error) {
    return NextResponse.json(
      {
        error: "不正なJSON形式です",
        code: "INVALID_JSON",
      },
      { status: 400 },
    );
  }

  const validatedBody = validateRequestBody(requestBody);
  if (!validatedBody) {
    return NextResponse.json(
      {
        error: "入力内容が不正です",
        code: "INVALID_INPUT",
      },
      { status: 400 },
    );
  }

  const authorId = parseBigIntId(authResult.user.userId);
  if (authorId === null) {
    return NextResponse.json(
      {
        error: "ユーザー情報の取得に失敗しました",
        code: "INVALID_USER",
      },
      { status: 401 },
    );
  }

  const [randomKey1, randomKey2, randomKey3, randomKey4, randomKey5] =
    generateRandomKeys();

  try {
    let placeId: bigint;
    let placeName: string;

    // placeIdが直接提供された場合
    if ("placeId" in validatedBody) {
      placeId = validatedBody.placeId;

      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { id: true, name: true },
      });

      if (!place) {
        return NextResponse.json(
          {
            error: "指定された場所が見つかりません",
            code: "PLACE_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      placeName = place.name;
    }
    // locationが提供された場合（自動的にPlaceを作成）
    else if ("location" in validatedBody) {
      const { latitude, longitude, name } = validatedBody.location;

      // 場所名が指定されていない場合はデフォルト値を設定
      const locationName = name || `位置情報 (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

      try {
        const createdPlace = await SpatialQueries.createPlace(
          locationName,
          longitude,
          latitude,
        );

        placeId = BigInt(createdPlace.id);
        placeName = createdPlace.name;
      } catch (error) {
        console.error("Place creation error:", error);
        return NextResponse.json(
          {
            error: "位置情報の登録に失敗しました",
            code: "PLACE_CREATE_FAILED",
          },
          { status: 500 },
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "場所情報が不正です",
          code: "INVALID_LOCATION",
        },
        { status: 400 },
      );
    }

    const createdPost = await prisma.post.create({
      data: {
        mood_type: validatedBody.moodType,
        contents: validatedBody.contents,
        img: validatedBody.imageUrl,
        placeId,
        authorId,
        random_key_1: randomKey1,
        random_key_2: randomKey2,
        random_key_3: randomKey3,
        random_key_4: randomKey4,
        random_key_5: randomKey5,
      },
      select: {
        id: true,
        mood_type: true,
        contents: true,
        img: true,
        post_at: true,
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: createdPost.id.toString(),
          moodType: createdPost.mood_type,
          contents: createdPost.contents,
          imageUrl: createdPost.img,
          placeId: placeId.toString(),
          placeName,
          postedAt: createdPost.post_at.toISOString(),
          reactionCount: createdPost._count.reactions,
          author: {
            name: createdPost.author.name,
            avatar: createdPost.author.avatar,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      {
        error: "投稿の作成に失敗しました",
        code: "POST_CREATE_FAILED",
      },
      { status: 500 },
    );
  }
}

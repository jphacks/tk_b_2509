import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RawNumeric = string | number | bigint | null;

type RawPlaceRow = {
  id: RawNumeric;
  name: string;
  place_id: string | null;
  geom_text: string;
  distance_meters?: RawNumeric;
};

type RawDistanceRow = {
  distance_meters: RawNumeric;
};

export type PlaceLocation = {
  longitude: number;
  latitude: number;
};

export type PlaceWithLocation = {
  id: string;
  name: string;
  placeId: string | null;
  location: PlaceLocation;
  distanceMeters?: number;
};

const parsePointText = (geomText: string): PlaceLocation => {
  const match = geomText.trim().match(/^POINT\(([-\d.]+) ([-\d.]+)\)$/);
  if (!match) {
    throw new Error(`Invalid geometry text: ${geomText}`);
  }

  const [, lng, lat] = match;
  return {
    longitude: Number(lng),
    latitude: Number(lat),
  };
};

const coerceId = (value: RawNumeric): string => {
  if (value === null || value === undefined) {
    throw new Error("Place id is missing in the raw result");
  }
  if (typeof value === "string") {
    return value;
  }
  return value.toString();
};

const coerceNumber = (value: RawNumeric): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? undefined : asNumber;
};

const mapPlaceRow = (row: RawPlaceRow): PlaceWithLocation => {
  return {
    id: coerceId(row.id),
    name: row.name,
    placeId: row.place_id,
    location: parsePointText(row.geom_text),
    distanceMeters: coerceNumber(row.distance_meters),
  };
};

const executePlaceQuery = async <T = PlaceWithLocation[]>(
  promise: Promise<unknown>,
): Promise<T> => {
  const result = await promise;
  return result as T;
};

/**
 * 生のSQLで空間クエリを実行するためのユーティリティ関数
 */
export const SpatialQueries = {
  /**
   * 指定された座標からの距離で場所を検索
   * @param longitude 経度
   * @param latitude 緯度
   * @param radiusMeters 検索半径（メートル）
   * @param limit 最大結果数
   */
  async findPlacesWithinRadius(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit: number = 100,
  ): Promise<PlaceWithLocation[]> {
    const rows = await executePlaceQuery<RawPlaceRow[]>(
      prisma.$queryRaw`
        SELECT
          id,
          name,
          place_id,
          ST_AsText(geom) as geom_text,
          ST_Distance(
            geom::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          ) as distance_meters
        FROM "Place"
        WHERE ST_DWithin(
          geom::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
        ORDER BY distance_meters
        LIMIT ${limit}
      `,
    );

    return rows.map(mapPlaceRow);
  },

  /**
   * 指定されたバウンディングボックス内の場所を検索
   * @param minLng 最小経度
   * @param minLat 最小緯度
   * @param maxLng 最大経度
   * @param maxLat 最大緯度
   */
  async findPlacesInBoundingBox(
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number,
  ): Promise<PlaceWithLocation[]> {
    const rows = await executePlaceQuery<RawPlaceRow[]>(
      prisma.$queryRaw`
        SELECT
          id,
          name,
          place_id,
          ST_AsText(geom) as geom_text
        FROM "Place"
        WHERE geom && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
        ORDER BY name
      `,
    );

    return rows.map(mapPlaceRow);
  },

  /**
   * 場所を新規作成（GEOGRAPHY Point）
   * @param name 場所名
   * @param longitude 経度
   * @param latitude 緯度
   * @param placeId 外部サービスからの場所ID（任意）
   */
  async createPlace(
    name: string,
    longitude: number,
    latitude: number,
    placeId?: string,
  ): Promise<PlaceWithLocation> {
    const rows = await executePlaceQuery<RawPlaceRow[]>(
      prisma.$queryRaw`
        INSERT INTO "Place" (name, geom, place_id)
        VALUES (${name}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${placeId || null})
        RETURNING id, name, place_id, ST_AsText(geom) as geom_text
      `,
    );

    const [row] = rows;
    if (!row) {
      throw new Error("Failed to create place");
    }

    return mapPlaceRow(row);
  },

  /**
   * 場所の座標を更新
   * @param placeId 場所のID
   * @param longitude 新しい経度
   * @param latitude 新しい緯度
   */
  async updatePlaceLocation(
    placeId: string | number | bigint,
    longitude: number,
    latitude: number,
  ): Promise<PlaceWithLocation> {
    const rows = await executePlaceQuery<RawPlaceRow[]>(
      prisma.$queryRaw`
        UPDATE "Place"
        SET geom = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${placeId}
        RETURNING id, name, place_id, ST_AsText(geom) as geom_text
      `,
    );

    const [row] = rows;
    if (!row) {
      throw new Error(`Place not found: ${placeId.toString()}`);
    }

    return mapPlaceRow(row);
  },

  /**
   * 場所間の距離を計算
   * @param placeId1 場所1のID
   * @param placeId2 場所2のID
   */
  async calculateDistanceBetweenPlaces(
    placeId1: string | number | bigint,
    placeId2: string | number | bigint,
  ): Promise<number | undefined> {
    const rows = await executePlaceQuery<RawDistanceRow[]>(
      prisma.$queryRaw`
        SELECT
          ST_Distance(
            p1.geom::geography,
            p2.geom::geography
          ) as distance_meters
        FROM "Place" p1, "Place" p2
        WHERE p1.id = ${placeId1} AND p2.id = ${placeId2}
      `,
    );

    const [row] = rows;
    return row ? coerceNumber(row.distance_meters) : undefined;
  },
} as const;

/**
 * 便利な空間関数
 */
export const SpatialUtils = {
  /**
   * 経度・緯度からPostGISのPoint文字列を生成
   */
  createPointWKT: (longitude: number, latitude: number): string => {
    return `POINT(${longitude} ${latitude})`;
  },

  /**
   * メートルをキロメートルに変換
   */
  metersToKilometers: (meters: number): number => {
    return meters / 1000;
  },

  /**
   * キロメートルをメートルに変換
   */
  kilometersToMeters: (kilometers: number): number => {
    return kilometers * 1000;
  },

  /**
   * 距離を読みやすい文字列にフォーマット
   */
  formatDistance: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  },
};

export default prisma;

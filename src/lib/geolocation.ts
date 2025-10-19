// 現在地取得のための型定義と関数
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

// Geolocation APIのエラーコード
export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;

/**
 * ブラウザのGeolocation APIがサポートされているかチェック
 */
export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * 現在地を取得する関数
 * @param options 位置情報取得オプション
 * @returns 現在地の緯度経度情報
 */
export async function getCurrentLocation(
  options: GeolocationOptions = {},
): Promise<LocationData> {
  // Geolocation APIがサポートされているかチェック
  if (!isGeolocationSupported()) {
    throw new Error("このブラウザは位置情報取得をサポートしていません");
  }

  // デフォルトオプションの設定
  const defaultOptions: Required<GeolocationOptions> = {
    timeout: 10000, // 10秒タイムアウト
    maximumAge: 300000, // 5分間キャッシュ有効
    enableHighAccuracy: true, // 高精度モード
  };

  const finalOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message = "位置情報の取得に失敗しました";

        switch (error.code) {
          case GEOLOCATION_ERRORS.PERMISSION_DENIED:
            message = "位置情報取得の許可が拒否されました。ブラウザの設定で位置情報アクセスを許可してください。";
            break;
          case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
            message = "位置情報を取得できませんでした。GPSやネットワークの状態を確認してください。";
            break;
          case GEOLOCATION_ERRORS.TIMEOUT:
            message = "位置情報の取得がタイムアウトしました。しばらく経ってから再度お試しください。";
            break;
          default:
            message = `位置情報の取得で不明なエラーが発生しました (コード: ${error.code})`;
        }

        reject(new Error(message));
      },
      finalOptions,
    );
  });
}

/**
 * 位置情報をフォーマットして表示用の文字列を生成
 */
export function formatLocation(location: LocationData): string {
  const lat = location.latitude.toFixed(6);
  const lng = location.longitude.toFixed(6);
  return `${lat}, ${lng}`;
}

/**
 * 2点間の距離を計算（メートル単位）
 */
export function calculateDistance(
  from: LocationData,
  to: LocationData,
): number {
  const R = 6371e3; // 地球の半径（メートル）
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 距離を読みやすい文字列にフォーマット
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

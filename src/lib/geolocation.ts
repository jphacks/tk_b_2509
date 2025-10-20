// 現在地取得のための型定義と関数
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  name?: string;
  isDefault?: boolean;
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

// デフォルトロケーション（皇居）
export const DEFAULT_LOCATION = {
  latitude: 35.6852,
  longitude: 139.7528,
  name: "皇居",
  isDefault: true,
} as const;

// 権限状態の型定義
export type PermissionState = "granted" | "denied" | "prompt" | "unknown";

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
            message =
              "位置情報取得の許可が拒否されました。ブラウザの設定で位置情報アクセスを許可してください。";
            break;
          case GEOLOCATION_ERRORS.POSITION_UNAVAILABLE:
            message =
              "位置情報を取得できませんでした。GPSやネットワークの状態を確認してください。";
            break;
          case GEOLOCATION_ERRORS.TIMEOUT:
            message =
              "位置情報の取得がタイムアウトしました。しばらく経ってから再度お試しください。";
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

/**
 * 位置情報アクセス権限の状態を確認
 */
export async function checkLocationPermission(): Promise<PermissionState> {
  if (!isGeolocationSupported()) {
    return "unknown";
  }

  try {
    // Permissions APIが利用可能な場合
    if ("permissions" in navigator && navigator.permissions) {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state as PermissionState;
    }
    return "unknown";
  } catch (error) {
    console.warn("Permission check failed:", error);
    return "unknown";
  }
}

/**
 * 位置情報アクセス権限をリクエスト
 */
export async function requestLocationPermission(): Promise<PermissionState> {
  if (!isGeolocationSupported()) {
    return "unknown";
  }

  try {
    // まず現在の権限状態を確認
    const currentPermission = await checkLocationPermission();

    // 既に許可されている場合はそのまま返す
    if (currentPermission === "granted") {
      return "granted";
    }

    // 権限をリクエスト（実際の位置情報取得を試行）
    await getCurrentLocation({ timeout: 1000 });
    return "granted";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("許可が拒否")) {
      return "denied";
    }

    if (errorMessage.includes("タイムアウト")) {
      return "prompt"; // タイムアウトはプロンプト状態として扱う
    }

    return "unknown";
  }
}

/**
 * 現在地取得を試み、失敗したらデフォルト値を返す関数
 */
export async function getLocationWithFallback(
  options: GeolocationOptions = {},
): Promise<LocationData> {
  try {
    // まず実際の現在地取得を試行
    const location = await getCurrentLocation(options);
    return {
      ...location,
      name: "現在地",
      isDefault: false,
    };
  } catch (error) {
    console.warn("現在地取得に失敗、デフォルト値を使用します:", error);

    // 失敗した場合は皇居をデフォルト値として返す
    return {
      ...DEFAULT_LOCATION,
      timestamp: Date.now(),
    };
  }
}

/**
 * ログイン時の位置情報設定処理
 * 権限リクエストとフォールバック処理を統合
 */
export async function setupLocationOnLogin(): Promise<{
  location: LocationData;
  permission: PermissionState;
  message: string;
}> {
  try {
    // まず権限をリクエスト
    const permission = await requestLocationPermission();

    if (permission === "granted") {
      // 権限が許可された場合、現在地を取得
      const location = await getCurrentLocation();
      return {
        location: {
          ...location,
          name: "現在地",
          isDefault: false,
        },
        permission,
        message: "位置情報アクセスが許可されました。現在地が設定されました。",
      };
    } else {
      // 権限が拒否された場合、デフォルト値を使用
      return {
        location: {
          ...DEFAULT_LOCATION,
          timestamp: Date.now(),
        },
        permission,
        message:
          "位置情報アクセスが拒否されました。皇居をデフォルト場所として設定します。",
      };
    }
  } catch (error) {
    console.error("位置情報設定エラー:", error);

    // エラー時はデフォルト値を使用
    return {
      location: {
        ...DEFAULT_LOCATION,
        timestamp: Date.now(),
      },
      permission: "unknown",
      message:
        "位置情報の設定に失敗しました。皇居をデフォルト場所として設定します。",
    };
  }
}

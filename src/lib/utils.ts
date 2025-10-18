import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ユーザー名からアバターフォールバック用の頭文字（最大2文字）を生成します。
 * @param username ユーザー名
 * @returns 大文字の頭文字（例: "shadcn" -> "SH", "ユーザ名" -> "ユ"）
 */
export function getAvatarFallback(username: string): string {
  if (!username) {
    return "??";
  }
  // 半角・全角に関わらず、先頭から2文字を取得し大文字に変換
  return username.substring(0, 2).toUpperCase();
}
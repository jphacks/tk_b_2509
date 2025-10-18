"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCESS_TOKEN_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

interface AuthUser {
  id: string;
  name: string;
  avatar?: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = useCallback(async (): Promise<AuthUser | null> => {
    try {
      // Cookieからアクセストークンを取得
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`))
        ?.split("=")[1];

      if (!token) {
        return null;
      }

      // トークンを検証
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return null;
      }

      // APIから最新のユーザー情報を取得
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error("ユーザー情報の取得に失敗しました");
      }

      const data = await response.json();

      return {
        id: data.user.id,
        name: data.user.name,
        avatar: data.user.avatar,
      };
    } catch (error) {
      console.error("認証情報取得エラー:", error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    const userInfo = await fetchUserInfo();
    setUser(userInfo);
    setIsLoading(false);
  }, [fetchUserInfo]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      // クライアントサイドで認証情報をクリア
      setUser(null);
      // Cookieをクリア
      document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // ホームページにリダイレクトしてログアウト状態を確実に反映
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };
}

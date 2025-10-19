"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setupLocationOnLogin } from "@/lib/geolocation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationSuccess, setLocationSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        const cachedToken = localStorage.getItem("token");
        if (!cachedToken) {
          return;
        }

        setLoading(true);
        const response = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cachedToken}`,
          },
          credentials: "include",
        });

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          router.replace("/feed");
        } else if (response.status === 401) {
          localStorage.removeItem("token");
        }
      } catch (sessionError) {
        console.error("セッション検証に失敗しました:", sessionError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "ログインに失敗しました");
        return;
      }

      const data = await response.json();

      // トークンをlocalStorageに保存
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // ログイン成功後に位置情報設定を試行
      try {
        const locationResult = await setupLocationOnLogin();

        // 位置情報をlocalStorageに保存（他のページで使用するため）
        localStorage.setItem(
          "userLocation",
          JSON.stringify(locationResult.location),
        );
        localStorage.setItem("locationPermission", locationResult.permission);

        // ユーザーに結果を通知
        setLocationMessage(locationResult.message);
        setLocationSuccess(locationResult.permission === "granted");

        // 3秒後にメッセージを自動的に消去
        setTimeout(() => {
          setLocationMessage("");
          setLocationSuccess(null);
        }, 3000);
      } catch (locationError) {
        console.error("位置情報設定エラー:", locationError);
        // 位置情報設定に失敗してもログインは継続
      }

      router.push("/feed");
    } catch (err) {
      setError("エラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
            ログイン
          </h1>
          <p className="text-center text-slate-600 mb-8">
            アカウントにログインしてください
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 名前入力 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                名前
              </label>
              <input
                id="name"
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kevin"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* パスワード入力 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 位置情報設定メッセージ */}
            {locationMessage && (
              <div
                className={`p-4 border rounded-lg ${
                  locationSuccess === true
                    ? "bg-green-50 border-green-200"
                    : locationSuccess === false
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    locationSuccess === true
                      ? "text-green-700"
                      : locationSuccess === false
                        ? "text-yellow-700"
                        : "text-blue-700"
                  }`}
                >
                  {locationMessage}
                </p>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          {/* サインアップリンク */}
          <p className="text-center text-slate-600 mt-6 text-sm">
            アカウントをお持ちですか？
            <a href="/signup" className="text-blue-600 hover:underline ml-1">
              サインアップ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

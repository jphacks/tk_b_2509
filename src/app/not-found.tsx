"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // 10秒後にホームにリダイレクト
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center">
        {/* エラーコード */}
        <h1 className="text-9xl font-bold text-slate-300 mb-4">404</h1>

        {/* タイトル */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          ページが見つかりません
        </h2>

        {/* 説明文 */}
        <p className="text-lg text-slate-600 mb-8">
          申し訳ありません。お探しのページは存在しないか、移動されている可能性があります。
        </p>

        {/* カウントダウン */}
        <CountdownRedirect />

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ホームに戻る
          </Link>
          <Link
            href="/feed"
            className="px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            フィードを見る
          </Link>
        </div>
      </div>
    </div>
  );
}

function CountdownRedirect() {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div className="mb-6 text-sm text-slate-600">
      <p>
        {seconds > 0
          ? `${seconds}秒後に自動的にホームにリダイレクトします...`
          : "リダイレクト中..."}
      </p>
    </div>
  );
}

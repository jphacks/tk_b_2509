"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
// shadcn/uiコンポーネント
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils"; // shadcn/ui のセットアップで導入されるはずです
import type { ReviewCardProps } from "@/lib/post-types";

/**
 * おすすめ作業場所を表示するためのカードコンポーネント
 */
export function ReviewCard({
  placeName,
  badgeUrl,
  reviewText,
  imageUrl,
  reactionCount,
  userAvatarUrl,
  userAvatarFallback,
  username,
  className,
}: ReviewCardProps) {

  // liked: いいね済みか (true/false)
  // currentCount: 現在のいいね数
  const [liked, setLiked] = useState(false);
  const [currentCount, setCurrentCount] = useState(reactionCount); // 初期値をpropsで設定

  // ハートボタンがクリックされたときの処理
  const handleReactionClick = () => {
    if (liked) {
      // すでに「いいね」していた場合 (取り消し)
      setCurrentCount((prev: number) => prev - 1);
      setLiked(false);
    } else {
      // まだ「いいね」していない場合
      setCurrentCount((prev: number) => prev + 1);
      setLiked(true);
    }
    // 将来的にはここでAPIを叩いてサーバーに保存する処理も追加します
  };
  return (
    <Card className={cn("w-full max-w-lg", className)}>
      {/* ---------------------------------- */}
      {/* ヘッダー: 場所の名前 + バッジ       */}
      {/* ---------------------------------- */}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{placeName}</CardTitle>
          {/* バッジ（Next.jsのImageコンポーネントを使用） */}
          <Image
            src={badgeUrl}
            alt="バッジ"
            width={40} // バッジのサイズに合わせて調整してください
            height={40} // バッジのサイズに合わせて調整してください
            className="rounded-full" // バッジが円形や楕円形の場合
          />
        </div>
      </CardHeader>

      {/* ---------------------------------- */}
      {/* コンテンツ: レビュー文 + 場所の写真  */}
      {/* ---------------------------------- */}
      <CardContent>
        {/* grid と grid-cols-3 を使い、imageUrl がある場合のみ3カラムレイアウトを適用します。
          md: (中サイズスクリーン以上) でレイアウトが変わるようにしています。
        */}
        <div
          className={cn(
            "grid gap-4",
            imageUrl ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
          )}
        >
          {/* レビュー文 */}
          {/* imageUrl がある場合は 2/3、ない場合は 1/1 の幅を占めます */}
          <div className={cn(imageUrl ? "md:col-span-2" : "col-span-1")}>
            <p className="text-sm text-muted-foreground">{reviewText}</p>
          </div>

          {/* 場所の写真 (imageUrl が存在する場合のみ表示) */}
          {imageUrl && (
            <div className="md:col-span-1">
              <Image
                src={imageUrl}
                alt={`${placeName}の写真`}
                width={300} // width/heightはアスペクト比の維持に必要
                height={300}
                className="rounded-lg object-cover w-full aspect-square" // 正方形を担保
                unoptimized
              />
            </div>
          )}
        </div>
      </CardContent>

      {/* ---------------------------------- */}
      {/* フッター: リアクション + 投稿者     */}
      {/* ---------------------------------- */}
      <CardFooter className="flex justify-between items-center">
        {/* リアクション */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500"
            onClick={handleReactionClick}
            aria-pressed={liked}
            aria-label={liked ? "いいねを取り消す" : "いいね"}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                // liked状態に応じてハートを塗りつぶす
                liked && "fill-red-500"
              )}
              aria-hidden="true"
            />
            <span>{currentCount}</span>
          </Button>
        </div>

        {/* 投稿ユーザー */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userAvatarUrl ?? undefined} alt={username} />
            <AvatarFallback>{userAvatarFallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {username}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

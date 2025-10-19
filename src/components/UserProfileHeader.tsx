import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileHeaderProps {
  username: string;
  avatarUrl?: string | null;
}

/**
 * ユーザープロフィールヘッダーコンポーネント
 * ユーザーのアバター画像とユーザー名を表示
 */
export function UserProfileHeader({
  username,
  avatarUrl,
}: UserProfileHeaderProps) {
  // ユーザー名から頭文字を取得
  function getAvatarFallback(name: string): string {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col items-center py-12 px-4">
      {/* アバター画像 */}
      <Avatar className="w-48 h-48 mb-6 border-4 border-slate-200">
        {avatarUrl ? (
          <>
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="text-6xl font-semibold">
              {getAvatarFallback(username)}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="text-6xl font-semibold">
            {getAvatarFallback(username)}
          </AvatarFallback>
        )}
      </Avatar>

      {/* ユーザー名 */}
      <h2 className="text-4xl font-bold text-slate-900">{username}</h2>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Edit2, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface UserProfileHeaderProps {
  username: string;
  avatarUrl?: string | null;
  userId: string | number;
  onProfileUpdate?: (name: string, avatar: string | null) => void;
}

/**
 * ユーザープロフィールヘッダーコンポーネント
 * ユーザーのアバター画像とユーザー名を表示・編集可能
 */
export function UserProfileHeader({
  username: initialUsername,
  avatarUrl: initialAvatarUrl,
  userId,
  onProfileUpdate,
}: UserProfileHeaderProps) {
  // ユーザー名から頭文字を取得
  function getAvatarFallback(name: string): string {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  }

  // 状態管理
  const [username, setUsername] = useState(initialUsername);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // アバター画像の選択
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingAvatar(true);

    try {
      // ファイルをData URLに変換
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        // APIで更新
        const response = await fetch("/api/user/updateAvatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: dataUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to update avatar");
        }

        const data = await response.json();
        setAvatarUrl(data.user.avatar);
        onProfileUpdate?.(username, data.user.avatar);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("アバター画像の更新に失敗しました");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  // ユーザー名の編集を開始
  const handleStartEditingUsername = () => {
    setIsEditingUsername(true);
    setEditedUsername(username);
  };

  // ユーザー名の編集を完了
  const handleSaveUsername = async () => {
    if (editedUsername === username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      const response = await fetch("/api/user/updateProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedUsername }),
      });

      if (response.status === 409) {
        alert(
          `${editedUsername}は既に使用されています。別の名前を使用してください。`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const data = await response.json();
      setUsername(data.user.name);
      setIsEditingUsername(false);
      onProfileUpdate?.(data.user.name, avatarUrl ?? null);
    } catch (error) {
      console.error("Error updating username:", error);
      alert("ユーザー名の更新に失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-center py-12 px-4">
      {/* アバター画像 - 編集可能 */}
      <div className="relative mb-6 group">
        <Avatar className="w-48 h-48 border-4 border-slate-200">
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

        {/* アバター編集オーバーレイ */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdatingAvatar}
            className="flex flex-col items-center gap-2 text-white"
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm font-semibold">
              アバター画像を編集
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      {/* ユーザー名 - 編集可能 */}
      <div className="flex items-center gap-2 group">
        {isEditingUsername ? (
          <input
            type="text"
            value={editedUsername}
            onChange={(e) => setEditedUsername(e.target.value)}
            className="text-4xl font-bold text-slate-900 bg-slate-100 border border-blue-500 rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <h2 className="text-4xl font-bold text-slate-900">{username}</h2>
        )}

        {/* 編集/完了ボタン */}
        <button
          onClick={
            isEditingUsername ? handleSaveUsername : handleStartEditingUsername
          }
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded"
        >
          {isEditingUsername ? (
            <Check className="w-6 h-6 text-green-600" />
          ) : (
            <Edit2 className="w-6 h-6 text-slate-600" />
          )}
        </button>
      </div>
    </div>
  );
}


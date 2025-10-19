"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import type { ImageUploadProps } from "@/lib/post-types";

export default function ImageUpload({
  selectedImage,
  onImageSelect,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert("画像は5MB以下である必要があります");
        return;
      }

      // 画像ファイルチェック
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルを選択してください");
        return;
      }

      // プレビュー生成
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (preview && selectedImage) {
    return (
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
        <Image
          src={preview}
          alt="プレビュー"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={handleRemoveImage}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="cursor-pointer">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <Upload className="w-6 h-6 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">写真を選択</span>
        <span className="text-xs text-slate-500">(最大5MB)</span>
      </div>
    </label>
  );
}

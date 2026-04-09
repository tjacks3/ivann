"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { uploadAvatar } from "@/lib/supabase/storage";
import { updateBrandAvatarUrl } from "@/app/(app)/brand/profile/actions";
import { useTranslation } from "@/i18n";

interface BrandAvatarUploadProps {
  currentAvatarUrl?: string;
  brandName: string;
  userId: string;
  onAvatarChange?: (url: string) => void;
}

export function BrandAvatarUpload({
  currentAvatarUrl,
  brandName,
  userId,
  onAvatarChange,
}: BrandAvatarUploadProps) {
  const { t } = useTranslation();
  const supabase = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);

  const initials = brandName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const url = await uploadAvatar(supabase, file, userId);
      await updateBrandAvatarUrl(url);
      setPreviewUrl(url);
      onAvatarChange?.(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "FILE_TOO_LARGE") {
        setError(t("profile.edit.photoSizeError"));
      } else if (msg === "INVALID_TYPE") {
        setError(t("profile.edit.photoTypeError"));
      } else {
        setError(t("profile.edit.photoError"));
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative"
      >
        <Avatar className="size-24 text-lg">
          {previewUrl && <AvatarImage src={previewUrl} alt={brandName} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-white" />
          ) : (
            <Camera className="size-6 text-white" />
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-primary hover:underline"
      >
        {uploading ? t("profile.edit.uploadingPhoto") : t("profile.edit.changePhoto")}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

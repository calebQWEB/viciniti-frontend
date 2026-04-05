"use client";

import { useRef, useState } from "react";
import { ImageObject } from "@/types/listing";
import { useImageUpload } from "@/hooks/useImageUpload";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  images: ImageObject[];
  onChange: (images: ImageObject[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const { uploadImage, uploading, error } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;

    // Only process up to the remaining slots
    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      const result = await uploadImage(file);
      if (result) {
        // Add each uploaded image to the existing array
        onChange([...images, result]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (public_id: string) => {
    onChange(images.filter((img) => img.public_id !== public_id));
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {canUploadMore && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
              : "border-gray-300 hover:border-[#2D6A4F] hover:bg-[#2D6A4F]/5"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">Click or drag images here</p>
              <p className="text-xs">
                JPEG, PNG, WebP · Max 5MB · {images.length}/{maxImages} uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={img.public_id}
              className="relative group rounded-lg overflow-hidden aspect-square"
            >
              <Image
                src={img.url}
                alt="Listing image"
                fill
                className="object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(img.public_id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

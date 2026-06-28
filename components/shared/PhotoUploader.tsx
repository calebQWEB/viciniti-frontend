"use client";

import { useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

interface PhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  photos?: string[];
}

export default function PhotoUploader({
  onPhotosChange,
  maxPhotos = 5,
  photos = [],
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(photos);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    setIsUploading(true);

    try {
      const filesToUpload = Array.from(files);

      // Check total would not exceed max
      if (uploadedPhotos.length + filesToUpload.length > maxPhotos) {
        setError(`Maximum ${maxPhotos} photos allowed`);
        setIsUploading(false);
        return;
      }

      // Validate each file
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          setIsUploading(false);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB
          setError("Images must be less than 5MB");
          setIsUploading(false);
          return;
        }
      }

      // Upload each file to Cloudinary
      const newPhotos: string[] = [];
      for (const file of filesToUpload) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await api.post("/upload/image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data?.url) {
            newPhotos.push(response.data.url);
          }
        } catch (err) {
          console.error("Failed to upload file:", err);
          setError("Failed to upload one or more images");
          setIsUploading(false);
          return;
        }
      }

      const updated = [...uploadedPhotos, ...newPhotos];
      setUploadedPhotos(updated);
      onPhotosChange(updated);
    } catch (err) {
      setError("Failed to upload images");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (index: number) => {
    const updated = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(updated);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          disabled={isUploading || uploadedPhotos.length >= maxPhotos}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            {isUploading
              ? "Uploading to Cloudinary..."
              : "Drag and drop photos here or click to browse"}
          </p>
          <p className="text-xs text-gray-500">
            {uploadedPhotos.length} of {maxPhotos} photos
            {isUploading && " (uploading...)"}
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Photo Preview Grid */}
      {uploadedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

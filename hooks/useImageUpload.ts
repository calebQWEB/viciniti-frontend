import { useState } from "react";
import api from "@/lib/api";
import { ImageObject } from "@/types/listing";

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<ImageObject | null>;
  uploading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<ImageObject | null> => {
    setUploading(true);
    setError(null);

    try {
      // FormData for file uploads
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data as ImageObject;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
}

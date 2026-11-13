// back-end2/app/frontend/src/hooks/useImageUploader.ts
import { useState, ChangeEvent } from 'react';

interface UseImageUploaderReturn {
  selectedFile: File | null;
  previewUrl: string | null;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  clearImage: () => void;
}

export const useImageUploader = (): UseImageUploaderReturn => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return {
    selectedFile,
    previewUrl,
    handleFileChange,
    clearImage,
  };
};
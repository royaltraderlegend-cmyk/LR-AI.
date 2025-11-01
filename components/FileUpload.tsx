
import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  imagePreviewUrl: string | null;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, imagePreviewUrl }) => {
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }, [onFileChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    } else {
        onFileChange(null);
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor="chart-upload"
        className="relative flex flex-col items-center justify-center w-full min-h-[250px] p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Chart Preview" className="max-h-96 object-contain rounded-md" />
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="mt-2 text-lg font-semibold text-gray-400">
              <span className="text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, or WEBP</p>
          </div>
        )}
        <input
          id="chart-upload"
          type="file"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleInputChange}
        />
      </label>
    </div>
  );
};


import React, { useRef, useState } from 'react';
import { ProcessedImage } from '../types';
import { PaperClipIcon } from './icons';

interface FileUploadProps {
  onFileProcessed: (file: ProcessedImage | null) => void;
  label?: string;
  acceptedFileTypes?: string; // e.g., "image/*,.pdf"
  maxFileSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  label = "Attach File",
  acceptedFileTypes = "image/jpeg, image/png, image/gif, image/webp", // Common image types
  maxFileSizeMB = 5 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFileName(null);
    onFileProcessed(null);

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size: ${maxFileSizeMB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      return;
    }
    
    // Basic MIME type check if acceptedFileTypes is restrictive like "image/*"
    // More robust check might be needed depending on Gemini API requirements for specific image types.
    const isAcceptedType = acceptedFileTypes.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.endsWith('/*')) {
        return file.type.startsWith(trimmedType.slice(0, -2));
      }
      return file.type === trimmedType;
    });

    if (!isAcceptedType) {
         setError(`Invalid file type. Accepted: ${acceptedFileTypes}. Detected: ${file.type}`);
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
    }


    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      onFileProcessed({ base64: base64String, mimeType: file.type, name: file.name });
      setFileName(file.name);
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-start">
      <button
        type="button"
        onClick={triggerFileInput}
        className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-primary-light/20 focus:outline-none focus:ring-2 focus:ring-primary-light"
        aria-label={label}
      >
        <PaperClipIcon className="w-6 h-6" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes}
      />
      {fileName && <p className="text-sm text-green-600 mt-1 ml-2">File: {fileName}</p>}
      {error && <p className="text-sm text-red-500 mt-1 ml-2">{error}</p>}
    </div>
  );
};

export default FileUpload;
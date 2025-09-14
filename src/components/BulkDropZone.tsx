import React, { useState } from "react";
import { Upload } from "lucide-react";
interface BulkDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxImages: number;
  className?: string;
}
export function BulkDropZone({
  onFilesSelected,
  maxImages,
  className
}: BulkDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesSelected(files.slice(0, maxImages));
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files.slice(0, maxImages));
    }
  };
  return;
}
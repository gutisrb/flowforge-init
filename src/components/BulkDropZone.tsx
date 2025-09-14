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
  return (
    <div
      className={`border-2 border-dashed border-border rounded-lg p-3 text-center transition-colors ${
        isDragOver ? "border-primary bg-primary/5" : ""
      } ${className || ""}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Prevucite fotografije ili kliknite da odaberete
      </p>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="bulk-drop-input"
      />
      <label
        htmlFor="bulk-drop-input"
        className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded text-sm cursor-pointer hover:bg-primary/90 transition-colors"
      >
        Odaberite fajlove
      </label>
    </div>
  );
}
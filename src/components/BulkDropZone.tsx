import React, { useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
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
      className={cn(
        "border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-200 cursor-pointer touch-manipulation",
        isDragOver 
          ? "border-primary bg-primary/10 scale-[1.02]" 
          : "border-border hover:border-primary/50 hover:bg-primary/5",
        maxImages <= 0 && "opacity-50 cursor-not-allowed",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => maxImages > 0 && document.getElementById("bulk-file-input")?.click()}
    >
      <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-foreground">
        {maxImages > 0 ? "Dodajte slike" : "Maksimum slika dostignut"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {maxImages > 0 ? `Prevucite ili kliknite • Još ${maxImages} slika` : "Uklonite slike da biste dodali nove"}
      </p>
      <input
        id="bulk-file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
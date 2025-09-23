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
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer
          min-h-[240px] flex flex-col items-center justify-center overflow-hidden
          ${isDragOver 
            ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-2xl shadow-primary/30 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
          }
          ${maxImages <= 0 ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => maxImages > 0 && document.getElementById("bulk-file-input")?.click()}
      >
        {/* Upload Icon */}
        <div className={`w-20 h-20 rounded-full mb-6 flex items-center justify-center transition-all duration-300 ${
          isDragOver ? "bg-primary/20 scale-110" : "bg-muted/50"
        }`}>
          <span className="text-3xl">📸</span>
        </div>

        {/* Main Text */}
        <h3 className="text-xl font-semibold mb-3 text-foreground">
          {isDragOver ? "Otpusti fotografije ovde" : "Dodaj fotografije"}
        </h3>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-6 max-w-md">
          {isDragOver 
            ? "Slike će biti automatski raspoređene po slotovima"
            : "Povuci i otpusti slike ili klikni za izbor datoteka"
          }
        </p>

        {/* Stats */}
        <div className="text-13 text-muted-foreground/70">
          {maxImages > 0 ? `Još ${maxImages} slika • JPG, PNG, WebP` : "Maksimum slika dostignut"}
        </div>

        {/* Hidden input */}
        <input
          id="bulk-file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Animated gradient glow on drag */}
        {isDragOver && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-2xl pointer-events-none animate-pulse" />
            <div className="absolute inset-2 border border-primary/30 rounded-2xl pointer-events-none animate-pulse" />
          </>
        )}
      </div>
  );
}
import React, { useState } from "react";
import { Upload } from "lucide-react";

interface BulkDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxImages: number;
  className?: string;
}

export function BulkDropZone({ onFilesSelected, maxImages, className }: BulkDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
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
      className={`
        relative bg-gradient-to-br from-accent/10 to-primary/10 
        rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? "border-accent bg-accent/20 scale-[1.02]" 
          : "border-accent/40 hover:border-accent hover:bg-accent/15"
        }
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => document.getElementById('bulk-file-input')?.click()}
    >
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
        <div className={`
          p-2 rounded-full transition-colors
          ${isDragOver ? "bg-accent text-white" : "bg-accent/20 text-accent"}
        `}>
          <Upload className="h-5 w-5" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Otpremi fotografije
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Prevuci fotografije ovde ili klikni za izbor
          </p>
        </div>
      </div>
      
      <input
        id="bulk-file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
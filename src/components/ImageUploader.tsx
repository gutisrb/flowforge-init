import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, GripVertical } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 2 }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files)
      .filter(file => file.type.match(/^image\/(png|jpe?g|webp)$/i))
      .slice(0, maxImages - images.length);
    
    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
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

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Prevucite slike ili kliknite da odaberete
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG ili WEBP do {maxImages} slika
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Odaberite fajlove
          </Button>
        </div>
      )}

      {/* Image Thumbnails */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Uploaded images ({images.length}/{maxImages})
          </p>
          <div className="space-y-3">
            {images.map((image, index) => (
              <ImageThumbnail
                key={`${image.name}-${index}`}
                image={image}
                index={index}
                total={images.length}
                onRemove={() => removeImage(index)}
                onReorder={reorderImages}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ImageThumbnailProps {
  image: File;
  index: number;
  total: number;
  onRemove: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function ImageThumbnail({ image, index, total, onRemove, onReorder }: ImageThumbnailProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  };

  const imageUrl = URL.createObjectURL(image);

  return (
    <div
      className={`flex items-center gap-4 p-4 border rounded-lg bg-card transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Handle */}
      <div className="cursor-move text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Image Preview */}
      <div className="flex-shrink-0">
        <img
          src={imageUrl}
          alt={image.name}
          className="w-20 h-20 object-cover rounded-md"
        />
      </div>

      {/* Image Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{image.name}</p>
        <p className="text-sm text-muted-foreground">
          {(image.size / 1024 / 1024).toFixed(1)} MB • Image {index + 1}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
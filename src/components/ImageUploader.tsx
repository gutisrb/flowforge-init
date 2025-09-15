import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 2 }: ImageUploaderProps) {
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

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Multiple File Input */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center transition-colors">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Odaberite do {maxImages} slika
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG ili WEBP
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
                onRemove={() => removeImage(index)}
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
  onRemove: () => void;
}

function ImageThumbnail({ image, index, onRemove }: ImageThumbnailProps) {
  const imageUrl = URL.createObjectURL(image);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
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
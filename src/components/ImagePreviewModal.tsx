import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  title?: string;
}

export function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  file, 
  title = "Pregled fotografije" 
}: ImagePreviewModalProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  // Create and cleanup object URL
  useEffect(() => {
    if (!file) {
      setImageUrl('');
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                console.error('Failed to load preview image:', file.name);
              }}
            />
          )}
        </div>
        
        <div className="p-4 pt-0 text-sm text-muted-foreground text-center">
          <p>{file.name} • {(file.size / 1024 / 1024).toFixed(1)}MB</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Zap, Folder } from "lucide-react";
import { SlotData } from "./ImageSlots";

interface BulkUploadProps {
  onFilesSelected: (files: File[]) => void;
  slots: SlotData[];
}

export function BulkUpload({ onFilesSelected, slots }: BulkUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const availableSlots = slots.reduce((acc, slot) => {
    const maxImages = slot.mode === "image-to-video" ? 1 : 2;
    return acc + (maxImages - slot.images.length);
  }, 0);

  return (
    <Card 
      className="p-6 border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Bulk Upload</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload multiple photos at once and auto-distribute them across available slots
          </p>
          <div className="text-xs text-gray-500">
            Available slots: {availableSlots}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="default"
            size="sm"
            className="flex-1 max-w-48"
          >
            <Folder className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          or drag and drop multiple files here
        </div>
      </div>
    </Card>
  );
}
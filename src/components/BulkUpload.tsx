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
      className="p-8 border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Zap className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-xl text-foreground mb-3">Masovno učitavanje</h3>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            Učitajte više fotografija odjednom i automatski ih distribuirajte u dostupne slotove
          </p>
          <div className="text-base text-muted-foreground font-medium">
            Dostupno slotova: {availableSlots}
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
        
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="default"
            size="lg"
            className="min-h-[44px] px-8 text-base font-semibold focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Folder className="h-5 w-5 mr-3" />
            Izaberi fotografije
          </Button>
        </div>

        <div className="text-base text-muted-foreground">
          ili prevucite više fotografija ovde
        </div>
      </div>
    </Card>
  );
}
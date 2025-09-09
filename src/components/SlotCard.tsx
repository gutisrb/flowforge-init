import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Trash2, Eye, MoreVertical } from "lucide-react";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  mode: "image-to-video" | "frame-to-frame";
  onImagesChange: (images: File[]) => void;
  onModeChange: (mode: "image-to-video" | "frame-to-frame") => void;
  onSwapImages: () => void;
  onRemoveSlot: () => void;
  onReceiveInternalImage: (payload: { fromSlot: number; imageIndex: number }) => void;
}

export function SlotCard({
  slotIndex,
  images,
  mode,
  onImagesChange,
  onModeChange,
  onSwapImages,
  onRemoveSlot,
  onReceiveInternalImage,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleExternalFileDrop = (files: File[]) => {
    const newImages = [...images];
    files.forEach(file => {
      if (newImages.length < 2) {
        newImages.push(file);
      }
    });
    onImagesChange(newImages);
    if (newImages.length === 2) onModeChange("frame-to-frame");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // internal image move?
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (payload) {
      try {
        const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
        onReceiveInternalImage(data);
        return;
      } catch {}
    }

    // external files
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) handleExternalFileDrop(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length) handleExternalFileDrop(files);
    (e.target as HTMLInputElement).value = "";
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (newImages.length < 2 && mode === "frame-to-frame") onModeChange("image-to-video");
  };

  const openPreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  };

  const closePreview = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
  };

  return (
    <>
      <div
        className={`bg-white rounded-xl border-2 border-dashed ${isDragOver ? "border-primary" : "border-muted"} transition-colors p-4 h-full min-h-[280px] flex flex-col`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Slot Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Slot {slotIndex + 1}</span>
            {images.length === 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">Frame-to-Frame</Badge>
            )}
          </div>

          {images.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {images.length === 2 && (
                  <DropdownMenuItem onClick={onSwapImages} className="text-sm">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Zameni redosled
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onRemoveSlot} className="text-sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Ukloni slot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div
          className={`flex-1 rounded-lg ${images.length === 0 ? "bg-muted/30" : ""} p-3`}
        >
          {images.length === 0 ? (
            <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted text-center text-xs text-muted-foreground hover:bg-muted/50">
              <span>Dodaj 1 ili 2 fotografije</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, imageIndex) => (
                <div key={imageIndex} className="relative group bg-muted rounded-lg overflow-hidden aspect-[16/9]">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Slika ${imageIndex + 1}`}
                    className="w-full h-full object-cover"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/x-smartflow-image", JSON.stringify({ fromSlot: slotIndex, imageIndex }));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {imageIndex === 0 ? "Početak" : "Kraj"}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => openPreview(image)} title="Pregled">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => removeImage(imageIndex)} title="Obriši">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {images.length < 2 && (
                <label className="flex h-36 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted text-center text-xs text-muted-foreground hover:bg-muted/50">
                  Dodaj još
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pregled</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center">
              <img src={previewImage} alt="Pregled" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ArrowLeftRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface SlotCardProps {
  slotIndex: number;
  images: File[];
  onImagesChange: (images: File[]) => void;
  onReceiveInternalImage: (payload: { fromSlot: number; imageIndex: number; toIndex?: number }) => void;
}

export function SlotCard({
  slotIndex,
  images,
  onImagesChange,
  onReceiveInternalImage,
}: SlotCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const addFiles = (files: File[]) => {
    const next = [...images, ...files].slice(0, 2);
    onImagesChange(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // move image from another (or same) slot
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (payload) {
      try {
        const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
        onReceiveInternalImage({ ...data });
        return;
      } catch {}
    }

    // external files
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) addFiles(files);
  };

  const onDropIntoIndex = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/x-smartflow-image");
    if (!payload) return;
    try {
      const data = JSON.parse(payload) as { fromSlot: number; imageIndex: number };
      onReceiveInternalImage({ ...data, toIndex });
    } catch {}
  };

  const removeAt = (i: number) => onImagesChange(images.filter((_, idx) => idx !== i));

  const swap = () => {
    if (images.length === 2) onImagesChange([images[1], images[0]]);
  };

  return (
    <>
      <div
        className={`rounded-xl border-2 border-dashed ${isDragOver ? "border-primary" : "border-muted"} p-4 h-full min-h-[320px] flex flex-col`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Slot {slotIndex + 1}</span>
            {images.length === 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">Frame-to-Frame</Badge>
            )}
          </div>

          {/* visible actions instead of 3-dot menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2"
              disabled={images.length < 2}
              onClick={swap}
              title="Zameni redosled unutar slota"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" /> Swap
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className={`flex-1 ${images.length === 0 ? "bg-muted/30" : ""} rounded-lg p-3`}>
          {images.length === 0 ? (
            <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted text-center text-sm text-muted-foreground hover:bg-muted/50">
              <span>Dodaj 1 ili 2 fotografije</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
                  if (files.length) addFiles(files);
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[0,1].map((idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropIntoIndex(idx)}
                  className={`relative rounded-lg overflow-hidden aspect-[9/16] bg-muted ${images[idx] ? "" : "border-2 border-dashed border-muted flex items-center justify-center text-xs text-muted-foreground"}`}
                >
                  {images[idx] ? (
                    <>
                      <img
                        src={URL.createObjectURL(images[idx])}
                        alt=""
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/x-smartflow-image",
                            JSON.stringify({ fromSlot: slotIndex, imageIndex: idx })
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {idx === 0 ? "Početak" : "Kraj"}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPreviewUrl(URL.createObjectURL(images[idx]!))}
                          title="Pregled"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeAt(idx)}
                          title="Obriši"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <span>Dodaj</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <Dialog open={!!previewUrl} onOpenChange={(o) => !o && previewUrl && (URL.revokeObjectURL(previewUrl), setPreviewUrl(null))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Pregled</DialogTitle></DialogHeader>
          {previewUrl && <img src={previewUrl} className="max-h-[70vh] w-full object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

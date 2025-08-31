import { useState, useRef } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import {
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlotData {
  id: string;
  mode: "image-to-video" | "frame-to-frame";
  images: File[];
}

interface ImageSlotsProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
  totalImages: number;
}

function SortableSlot({ 
  slot, 
  index, 
  onModeToggle, 
  onImagesChange 
}: { 
  slot: SlotData; 
  index: number;
  onModeToggle: (id: string) => void;
  onImagesChange: (id: string, files: File[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxFiles = slot.mode === "image-to-video" ? 1 : 2;
    const selectedFiles = files.slice(0, maxFiles);
    onImagesChange(slot.id, selectedFiles);
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = slot.images.filter((_, idx) => idx !== imageIndex);
    onImagesChange(slot.id, newImages);
  };

  const getSlotStatus = () => {
    if (slot.mode === "image-to-video") {
      return slot.images.length === 1 ? "Kompletno" : "Dodaj sliku";
    } else {
      if (slot.images.length === 0) return "Dodaj slike";
      if (slot.images.length === 1) return "Dodaj drugu sliku";
      return "Kompletno";
    }
  };

  const isComplete = () => {
    return slot.mode === "image-to-video" 
      ? slot.images.length === 1 
      : slot.images.length === 2;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative backdrop-blur-sm bg-gray-800/40 dark:bg-gray-200/10 border border-gray-200/20 dark:border-gray-700/30 rounded-xl p-6 min-h-[240px] transition-all duration-300 shadow-lg hover:shadow-xl",
        isDragging ? "opacity-50 scale-95" : "",
        isComplete() ? "bg-primary/10 border-primary/30 shadow-primary/20" : "hover:bg-gray-800/50 dark:hover:bg-gray-200/20",
        "cursor-grab active:cursor-grabbing hover:scale-105"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
            {index + 1}
          </div>
          <Badge variant="outline" className="text-xs backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
            Slot {index + 1}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onModeToggle(slot.id);
          }}
          className="text-xs h-7 px-3 rounded-full backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/20"
        >
          {slot.mode === "image-to-video" ? (
            <>
              <Video className="w-3 h-3 mr-1" />
              Video
            </>
          ) : (
            <>
              <ImageIcon className="w-3 h-3 mr-1" />
              Frame
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {slot.images.map((file, imageIndex) => (
          <div key={imageIndex} className="relative group">
            <div className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/60 dark:bg-gray-700/50 rounded-lg border border-white/20 dark:border-gray-600/30 shadow-sm">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[120px]">
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(imageIndex);
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {slot.images.length < (slot.mode === "image-to-video" ? 1 : 2) && (
          <Button
            variant="ghost"
            className="w-full h-20 border-2 border-dashed border-white/30 dark:border-gray-500/30 hover:border-primary/50 text-muted-foreground hover:text-primary backdrop-blur-sm bg-white/20 dark:bg-gray-600/20 hover:bg-white/40 dark:hover:bg-gray-600/40 rounded-lg transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <div className="text-center">
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs">{getSlotStatus()}</div>
            </div>
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={slot.mode === "frame-to-frame"}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

export function ImageSlots({ slots, onSlotsChange, totalImages }: ImageSlotsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = slots.findIndex(slot => slot.id === active.id);
      const newIndex = slots.findIndex(slot => slot.id === over.id);
      
      onSlotsChange(arrayMove(slots, oldIndex, newIndex));
    }
  };

  const handleModeToggle = (slotId: string) => {
    const newSlots = slots.map(slot => {
      if (slot.id === slotId) {
        const newMode: "image-to-video" | "frame-to-frame" = 
          slot.mode === "image-to-video" ? "frame-to-frame" : "image-to-video";
        return {
          ...slot,
          mode: newMode,
          images: [] // Clear images when switching modes
        };
      }
      return slot;
    });
    onSlotsChange(newSlots);
  };

  const handleImagesChange = (slotId: string, files: File[]) => {
    const newSlots = slots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, images: files };
      }
      return slot;
    });
    onSlotsChange(newSlots);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg">
        <h2 className="text-xl font-semibold text-foreground">
          Fotografije ({totalImages}/5+)
        </h2>
        <Badge 
          variant={totalImages >= 5 ? "default" : "secondary"}
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-sm"
        >
          {totalImages >= 5 ? "Spremno" : "Potrebno još " + Math.max(0, 5 - totalImages)}
        </Badge>
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={slots}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {slots.map((slot, index) => (
              <SortableSlot
                key={slot.id}
                slot={slot}
                index={index}
                onModeToggle={handleModeToggle}
                onImagesChange={handleImagesChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <div className="text-center p-4 backdrop-blur-sm bg-white/40 dark:bg-gray-800/30 rounded-xl border border-white/20 dark:border-gray-700/30">
        <p className="text-sm text-muted-foreground">
          Dovucite slike da promenite redosled. Kliknite na "Video"/"Frame" da promenite režim slota.
        </p>
      </div>
    </div>
  );
}
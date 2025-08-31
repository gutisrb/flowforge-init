import React, { useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Upload, GripVertical, X, Image as ImageIcon } from "lucide-react";

export interface SlotData {
  id: string;
  mode: "image-to-video" | "frame-to-frame";
  images: File[];
}

export interface ImageSlotsProps {
  slots: SlotData[];
  onSlotsChange: (slots: SlotData[]) => void;
  totalImages: number;
}

interface SortableSlotProps {
  slot: SlotData;
  index: number;
  onModeToggle: (id: string) => void;
  onImagesChange: (id: string, images: File[]) => void;
}

function SortableSlot({ slot, index, onModeToggle, onImagesChange }: SortableSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const maxImages = slot.mode === "image-to-video" ? 1 : 2;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newImages = [...slot.images, ...files].slice(0, maxImages);
      onImagesChange(slot.id, newImages);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = slot.images.filter((_, i) => i !== imageIndex);
    onImagesChange(slot.id, newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      const newImages = [...slot.images, ...files].slice(0, maxImages);
      onImagesChange(slot.id, newImages);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const canAddMore = slot.images.length < maxImages;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative p-6 border-2 border-dashed transition-all duration-200 bg-white hover:shadow-md ${
        isDragging 
          ? 'opacity-50 rotate-1 shadow-lg scale-105' 
          : 'hover:border-primary/50'
      } ${
        slot.images.length > 0 
          ? 'border-primary/30 shadow-sm' 
          : 'border-gray-200 hover:border-primary/30'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-3 right-3 cursor-grab hover:cursor-grabbing opacity-30 hover:opacity-60 transition-opacity"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Slot Badge */}
      <Badge 
        variant="default"
        className="absolute -top-3 -left-3 h-7 w-7 rounded-full p-0 flex items-center justify-center text-sm font-semibold bg-primary text-primary-foreground shadow-sm"
      >
        {index + 1}
      </Badge>

      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={slot.mode === "image-to-video" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-xs font-medium"
          >
            Slika (1)
          </Button>
          <Button
            size="sm"
            variant={slot.mode === "frame-to-frame" ? "default" : "outline"}
            onClick={() => onModeToggle(slot.id)}
            className="text-xs font-medium"
          >
            Kadrovi (2)
          </Button>
        </div>

        {/* Image Display Area */}
        <div className="space-y-3">
          {slot.mode === "image-to-video" ? (
            // Single image mode
            <div className="space-y-2">
              {slot.images[0] ? (
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(slot.images[0])}
                    alt="Uploaded"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    onClick={() => handleRemoveImage(0)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-2 left-2 text-xs bg-white/90 px-2 py-1 rounded text-gray-700 shadow-sm">
                    {slot.images[0].name.length > 15 
                      ? slot.images[0].name.substring(0, 15) + "..." 
                      : slot.images[0].name}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center bg-gray-50/50">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Dodaj sliku</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Frame-to-frame mode
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map((imageIndex) => (
                <div key={imageIndex} className="space-y-1">
                  <div className="text-xs text-gray-600 font-medium">
                    {imageIndex === 0 ? "Prvi" : "Drugi"}
                  </div>
                  {slot.images[imageIndex] ? (
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(slot.images[imageIndex])}
                        alt={`Frame ${imageIndex + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(imageIndex)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-24 flex items-center justify-center bg-gray-50/50">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                        <p className="text-xs">Dodaj</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        {canAddMore && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={slot.mode === "frame-to-frame"}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Dodaj sliku
            </Button>
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-gray-500 text-center font-medium">
          {slot.images.length}/{maxImages} {slot.images.length === 1 ? 'slika' : 'slika'}
        </div>
      </div>
    </Card>
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

    if (active.id !== over?.id) {
      const oldIndex = slots.findIndex((slot) => slot.id === active.id);
      const newIndex = slots.findIndex((slot) => slot.id === over?.id);

      onSlotsChange(arrayMove(slots, oldIndex, newIndex));
    }
  };

  const handleModeToggle = (id: string) => {
    const newSlots = slots.map((slot) =>
      slot.id === id
        ? {
            ...slot,
            mode: slot.mode === "image-to-video" ? "frame-to-frame" as const : "image-to-video" as const,
            images: [], // Clear images when switching modes
          }
        : slot
    );
    onSlotsChange(newSlots);
  };

  const handleImagesChange = (id: string, images: File[]) => {
    const newSlots = slots.map((slot) =>
      slot.id === id ? { ...slot, images } : slot
    );
    onSlotsChange(newSlots);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Fotografije</h2>
          <Badge 
            variant={totalImages >= 5 ? "default" : "secondary"}
            className="px-3 py-1 font-medium"
          >
            {totalImages}/5+
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Organizujte fotografije u slotove • Prevucite za reorder
        </p>
      </div>

      {/* Slots */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slots.map(slot => slot.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
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

      {/* Instructions */}
      <div className="text-center p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600">
          💡 <strong>Saveti:</strong> Koristite "Slika" za statičke fotografije ili "Kadrovi" za animaciju između dve fotografije
        </p>
      </div>
    </div>
  );
}
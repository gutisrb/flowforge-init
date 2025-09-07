import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { X, RotateCw, Copy } from "lucide-react";

interface PhotoItemProps {
  id: string;
  file: File;
  index: number;
  label?: string;
  onRemove: () => void;
  onReplace: () => void;
  onDuplicate?: () => void;
  className?: string;
}

export function PhotoItem({ 
  id, 
  file, 
  index, 
  label, 
  onRemove, 
  onReplace, 
  onDuplicate,
  className = "h-24" 
}: PhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="text-xs text-gray-600 font-medium">{label}</div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group cursor-move ${isDragging ? 'opacity-50 z-50' : ''}`}
        {...listeners}
        {...attributes}
      >
        <img
          src={URL.createObjectURL(file)}
          alt={`Photo ${index + 1}`}
          className={`w-full ${className} object-cover rounded-lg border border-gray-200 transition-all duration-200 group-hover:border-primary/50`}
        />
        
        {/* Action buttons */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-2 w-2" />
          </Button>
          {onDuplicate && (
            <Button
              size="icon"
              variant="secondary"
              className="h-5 w-5 bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-2 w-2" />
            </Button>
          )}
        </div>

        {/* Replace overlay */}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg"
          onClick={onReplace}
        >
          <div className="text-white text-xs font-medium">Click to replace</div>
        </div>

        {/* File info */}
        <div className="absolute bottom-1 left-1 text-xs bg-white/90 px-1 py-0.5 rounded text-gray-700 shadow-sm max-w-[80%] truncate">
          {file.name}
        </div>

        {/* File size */}
        <div className="absolute bottom-1 right-1 text-xs bg-white/90 px-1 py-0.5 rounded text-gray-600 shadow-sm">
          {(file.size / 1024 / 1024).toFixed(1)}MB
        </div>
      </div>
    </div>
  );
}
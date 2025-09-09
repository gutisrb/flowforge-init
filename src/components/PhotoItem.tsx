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
    <div className="space-y-2">
      {label && (
        <div className="text-base text-muted-foreground font-semibold">{label}</div>
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
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-11 w-11 min-h-[44px] focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-5 w-5" />
          </Button>
          {onDuplicate && (
            <Button
              size="icon"
              variant="secondary"
              className="h-11 w-11 min-h-[44px] bg-background/90 focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Replace overlay */}
        <div 
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg focus:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onReplace}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onReplace();
            }
          }}
        >
          <div className="text-white text-base font-semibold">Kliknite za zamenu</div>
        </div>

        {/* File info */}
        <div className="absolute bottom-2 left-2 text-sm bg-background/95 px-3 py-1 rounded text-foreground shadow-sm max-w-[70%] truncate font-medium">
          {file.name}
        </div>

        {/* File size */}
        <div className="absolute bottom-2 right-2 text-sm bg-background/95 px-3 py-1 rounded text-muted-foreground shadow-sm font-medium">
          {(file.size / 1024 / 1024).toFixed(1)}MB
        </div>
      </div>
    </div>
  );
}
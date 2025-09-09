import React from "react";
import { ImageIcon } from "lucide-react";

interface PhotoDropZoneProps {
  id: string;
  onDrop: () => void;
  label?: string;
  className?: string;
  isActive?: boolean;
}

export function PhotoDropZone({ 
  id, 
  onDrop, 
  label, 
  className = "h-24", 
  isActive = false 
}: PhotoDropZoneProps) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="text-base text-muted-foreground font-semibold">{label}</div>
      )}
      <div
        className={`border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 transition-all duration-200 cursor-pointer hover:border-primary/50 hover:bg-primary/5 focus:border-primary focus:bg-primary/5 focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className} ${
          isActive 
            ? 'border-primary/50 bg-primary/10' 
            : 'border-border'
        }`}
        onClick={onDrop}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDrop();
          }
        }}
      >
        <div className="text-center text-muted-foreground">
          <ImageIcon className={`mx-auto mb-2 ${className.includes('h-32') ? 'h-8 w-8' : 'h-6 w-6'}`} />
          <p className="text-base font-medium">Dodaj fotografiju</p>
        </div>
      </div>
    </div>
  );
}
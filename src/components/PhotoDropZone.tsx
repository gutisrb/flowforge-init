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
    <div className="space-y-1">
      {label && (
        <div className="text-xs text-gray-600 font-medium">{label}</div>
      )}
      <div
        className={`border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50/50 transition-all duration-200 cursor-pointer hover:border-gray-300 ${className} ${
          isActive 
            ? 'border-primary/50 bg-primary/5' 
            : 'border-gray-200'
        }`}
        onClick={onDrop}
      >
        <div className="text-center text-gray-500">
          <ImageIcon className={`mx-auto mb-1 ${className.includes('h-32') ? 'h-8 w-8' : 'h-4 w-4'}`} />
          <p className="text-xs">Add photo</p>
        </div>
      </div>
    </div>
  );
}
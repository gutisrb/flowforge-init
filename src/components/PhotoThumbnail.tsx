import React, { useState } from "react";
import { Star, Trash2, MoreHorizontal, Shuffle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhotoThumbnailProps {
  file: File;
  index: number;
  isMainPhoto?: boolean;
  isPairedPhoto?: boolean;
  pairIndex?: number;
  onSetMainPhoto: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onSwapPair?: () => void;
  onPreview?: () => void;
  className?: string;
}

export function PhotoThumbnail({ 
  file, 
  index, 
  isMainPhoto = false,
  isPairedPhoto = false,
  pairIndex,
  onSetMainPhoto, 
  onRemove, 
  onDuplicate,
  onSwapPair,
  onPreview,
  className 
}: PhotoThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "relative group bg-white rounded-lg overflow-hidden border-2 transition-all duration-200",
        "hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isMainPhoto ? "border-yellow-400 shadow-lg" : "border-border",
        className
      )}
      style={{ aspectRatio: '9/16' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
      tabIndex={0}
    >
      <img
        src={URL.createObjectURL(file)}
        alt={`Fotografija ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Main photo badge */}
      {isMainPhoto && (
        <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 border-yellow-400">
          <Star className="h-3 w-3 mr-1" />
          Naslovna
        </Badge>
      )}

      {/* Pair badge */}
      {isPairedPhoto && pairIndex !== undefined && (
        <Badge className="absolute top-2 left-2 bg-blue-500 text-blue-900 border-blue-400">
          Par {Math.floor(pairIndex / 2) + 1}
        </Badge>
      )}

      {/* Index number */}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>

      {/* File size */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {(file.size / 1024 / 1024).toFixed(1)}MB
      </div>

      {/* Action overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {/* Main action buttons */}
        <Button
          size="icon"
          variant={isMainPhoto ? "secondary" : "outline"}
          className="h-11 w-11 bg-background/90 text-foreground hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onSetMainPhoto();
          }}
        >
          <Star className={cn("h-5 w-5", isMainPhoto && "fill-yellow-400 text-yellow-400")} />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          className="h-11 w-11"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-5 w-5" />
        </Button>

        {/* Advanced options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11 bg-background/90 text-foreground hover:bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-foreground">Napredno</h4>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={onDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopiraj fotografiju
              </Button>
              
              {onSwapPair && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={onSwapPair}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Zameni u paru
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
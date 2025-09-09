import React from "react";
import { Upload, Shuffle, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhotoHeaderProps {
  totalImages: number;
  maxImages: number;
  onAddPhotos: () => void;
  onAutoArrange: () => void;
  onGenerate: () => void;
  isGenerateEnabled: boolean;
  isLoading?: boolean;
  className?: string;
  isMobile?: boolean;
}

export function PhotoHeader({ 
  totalImages, 
  maxImages, 
  onAddPhotos, 
  onAutoArrange, 
  onGenerate,
  isGenerateEnabled,
  isLoading = false,
  className,
  isMobile = false
}: PhotoHeaderProps) {
  if (isMobile) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg",
        "p-4 flex items-center justify-between gap-3",
        className
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddPhotos}
            className="h-10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj
          </Button>
          
          <Badge variant="secondary" className="px-2 py-1">
            {totalImages}/{maxImages}+
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoArrange}
            className="h-10"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          
          <Button
            disabled={!isGenerateEnabled || isLoading}
            onClick={onGenerate}
            className="h-10 px-6"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generiši
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border",
      "p-4 flex items-center justify-between gap-4",
      className
    )}>
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground">Fotografije</h2>
        
        <Badge 
          variant={totalImages >= 5 ? "default" : "secondary"}
          className="px-3 py-1 text-sm font-medium"
        >
          {totalImages}/{maxImages}+
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onAddPhotos}
          className="min-h-[44px]"
        >
          <Upload className="h-4 w-4 mr-2" />
          Dodaj
        </Button>
        
        <Button
          variant="outline"
          onClick={onAutoArrange}
          className="min-h-[44px]"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Auto-rasporedi
        </Button>
        
        <Button
          disabled={!isGenerateEnabled || isLoading}
          onClick={onGenerate}
          className="min-h-[44px] px-6"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generisanje...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generiši
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
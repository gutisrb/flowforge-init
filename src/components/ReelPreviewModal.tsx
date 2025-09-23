import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Play } from 'lucide-react';

export function ReelPreviewModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="hover-lift"
          aria-label="Pogledaj primer reela"
        >
          <Play className="h-5 w-5 mr-2" />
          Pogledaj primer reela
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Primer reel videa</DialogTitle>
          <DialogDescription>
            Evo kako izgleda finalni video kreiran našim AI studiom
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-8">
          <div className="w-80 h-64 bg-muted rounded-lg border-2 border-border/50 flex items-center justify-center">
            {/* TODO: REEL_VIDEO_SAMPLE_PLACEHOLDER */}
            <div className="text-center text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Video primer će biti ovde</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
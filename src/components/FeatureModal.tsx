import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface FeatureModalProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureModal({ icon, title, description }: FeatureModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover-lift cursor-pointer h-full">
          <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-left pt-4 text-base leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
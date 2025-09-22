import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Play, 
  Download, 
  Copy, 
  MoreVertical, 
  FileText,
  Clock
} from 'lucide-react';

interface Asset {
  id: string;
  thumbnail: string;
  title: string;
  type: 'Video' | 'Pre-Posle';
  duration?: string;
  date: string;
  status: 'Draft' | 'Spremno' | 'Greška';
  description?: string;
}

interface AssetCardProps {
  asset: Asset;
  onPlay: (id: string) => void;
  onDownload: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyDescription: (id: string) => void;
}

const getStatusVariant = (status: Asset['status']) => {
  switch (status) {
    case 'Spremno':
      return 'default';
    case 'Draft':
      return 'secondary';
    case 'Greška':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getTypeColor = (type: Asset['type']) => {
  return type === 'Video' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground';
};

export const AssetCard = ({ 
  asset, 
  onPlay, 
  onDownload, 
  onDuplicate, 
  onCopyDescription 
}: AssetCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <Card className="key-card bg-card rounded-2xl shadow-md hover-lift group">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted rounded-t-2xl overflow-hidden">
          <img 
            src={asset.thumbnail} 
            alt={asset.title}
            className="w-full h-full object-cover"
          />
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="icon"
              className="gradient-accent text-white w-12 h-12 rounded-full"
              onClick={() => onPlay(asset.id)}
            >
              <Play className="w-5 h-5 fill-current" />
            </Button>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getTypeColor(asset.type)} text-xs font-medium`}>
              {asset.type}
            </Badge>
          </div>

          {/* Duration for videos */}
          {asset.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {asset.duration}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-heading-3 text-text-primary line-clamp-2 flex-1">
              {asset.title}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDuplicate(asset.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Dupliraj
                </DropdownMenuItem>
                {asset.description && (
                  <DropdownMenuItem onClick={() => onCopyDescription(asset.id)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Kopiraj opis
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-body text-text-subtle">
              {formatDate(asset.date)}
            </span>
            <Badge variant={getStatusVariant(asset.status)}>
              {asset.status}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onPlay(asset.id)}
          >
            <Play className="w-4 h-4 mr-2" />
            Pusti
          </Button>
          <Button
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onDownload(asset.id)}
          >
            <Download className="w-4 h-4 mr-2" />
            Preuzmi
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
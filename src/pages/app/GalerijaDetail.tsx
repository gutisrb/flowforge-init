import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Copy, ArrowLeft, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  user_id: string;
  kind: string;
  status: string;
  src_url: string | null;
  thumb_url: string | null;
  prompt: string | null;
  inputs: any;
  posted_to: any;
  created_at: string;
  width: number | null;
  height: number | null;
  duration: number | null;
}

const statusColors = {
  processing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ready: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const platformIcons: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

export function GalerijaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAsset = async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('assets')
        .select('id, user_id, kind, status, src_url, thumb_url, prompt, inputs, posted_to, created_at, width, height, duration')
        .eq('id', id)
        .single();

      if (error) throw error;

      setAsset(data as Asset);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Nije moguće učitati sadržaj',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  // Auto-refresh for processing items
  useEffect(() => {
    if (asset?.status !== 'processing') return;

    const interval = setInterval(() => {
      fetchAsset();
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [asset?.status, id]);

  const handleDownload = async () => {
    if (!asset || asset.status !== 'ready' || !asset.src_url) return;

    try {
      const response = await fetch(asset.src_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.kind}-${asset.id}.${asset.kind === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Nije moguće preuzeti fajl',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = () => {
    if (!asset?.src_url) return;
    navigator.clipboard.writeText(asset.src_url);
    toast({
      title: 'Kopirano',
      description: 'URL je kopiran u clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/app/galerija')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad na galeriju
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Sadržaj nije pronađen</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Button variant="ghost" onClick={() => navigate('/app/galerija')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Nazad na galeriju
      </Button>

      {/* Processing banner */}
      {asset.status === 'processing' && (
        <Alert className="mb-6 border-amber-500/20 bg-amber-500/10">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-600">
            Obrada u toku… obično par minuta. Stranica se automatski osvežava.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Large preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                {asset.kind === 'image' ? (
                  <img
                    src={asset.thumb_url || asset.src_url || ''}
                    alt={asset.prompt || 'Image'}
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                ) : (
                  <video
                    src={asset.src_url || ''}
                    poster={asset.thumb_url || ''}
                    controls
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Metadata panel */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  statusColors[asset.status as keyof typeof statusColors] ||
                  'bg-muted text-muted-foreground'
                }
              >
                {asset.status === 'processing'
                  ? 'Obrađuje se'
                  : asset.status === 'ready'
                  ? 'Spremno'
                  : 'Greška'}
              </Badge>
            </CardContent>
          </Card>

          {/* Prompt or Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {asset.kind === 'image' ? 'Prompt' : 'Parametri'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono">
                  {asset.kind === 'image'
                    ? asset.prompt || 'Nema prompt podataka'
                    : JSON.stringify(asset.inputs || {}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Posted to */}
          {asset.posted_to && Array.isArray(asset.posted_to) && asset.posted_to.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Objavljeno na</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {asset.posted_to.map((platform: string) => (
                    <Badge key={platform} variant="secondary">
                      {platformIcons[platform] || platform}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Akcije</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full"
                disabled={!asset.src_url}
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopiraj URL
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
                disabled={asset.status !== 'ready' || !asset.src_url}
              >
                <Download className="h-4 w-4 mr-2" />
                Preuzmi
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta podaci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Tip:</span>
                <span className="text-text-primary font-medium capitalize">{asset.kind}</span>
              </div>
              {asset.width && asset.height && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Rezolucija:</span>
                  <span className="text-text-primary font-medium">
                    {asset.width} × {asset.height}
                  </span>
                </div>
              )}
              {asset.kind === 'video' && asset.duration && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Trajanje:</span>
                  <span className="text-text-primary font-medium">
                    {formatDuration(asset.duration)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Kreirano:</span>
                <span className="text-text-primary font-medium">{formatDate(asset.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

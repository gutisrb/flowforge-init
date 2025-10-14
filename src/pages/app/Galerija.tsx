import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
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
}

const PAGE_SIZE = 24;

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

export function Galerija() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const observerTarget = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAssets = useCallback(async (offset = 0, append = false) => {
    try {
      let query = (supabase as any)
        .from('assets')
        .select('id, user_id, kind, status, src_url, thumb_url, prompt, inputs, posted_to, created_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (filter !== 'all') {
        query = query.eq('kind', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []) as Asset[];

      if (append) {
        setAssets(prev => [...prev, ...typedData]);
      } else {
        setAssets(typedData);
      }

      setHasMore(typedData.length === PAGE_SIZE);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri učitavanju galerije',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    setLoading(true);
    fetchAssets(0, false);
  }, [filter]);

  // Realtime subscription
  useEffect(() => {
    const channel = (supabase as any)
      .channel('assets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setAssets(prev => [payload.new as Asset, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAssets(prev =>
              prev.map(asset =>
                asset.id === payload.new.id ? (payload.new as Asset) : asset
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fallback polling for processing items
  useEffect(() => {
    const hasProcessing = assets.some(a => a.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchAssets(0, false);
    }, 10000);

    return () => clearInterval(interval);
  }, [assets, fetchAssets]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchAssets(assets.length, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [assets.length, hasMore, loading, fetchAssets]);

  const handleDownload = async (asset: Asset) => {
    if (asset.status !== 'ready' || !asset.src_url) return;

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

  const getDisplayText = (asset: Asset) => {
    if (asset.kind === 'video') {
      try {
        const inputsStr = JSON.stringify(asset.inputs || {});
        return inputsStr.substring(0, 100) + (inputsStr.length > 100 ? '...' : '');
      } catch {
        return '';
      }
    }
    return (asset.prompt || '').substring(0, 100) + ((asset.prompt?.length || 0) > 100 ? '...' : '');
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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-heading-1 font-bold mb-2">Moja galerija</h1>
        <p className="text-text-muted text-lg">
          Sve vaše fotografije i video snimci na jednom mestu
        </p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">Svi</TabsTrigger>
          <TabsTrigger value="image">Fotografije</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading && assets.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-text-muted text-lg mb-4">
                Još uvek nemate sadržaja
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/app/reel')}>Kreiraj video</Button>
                <Button variant="outline" onClick={() => navigate('/app/stage')}>
                  Staguj fotografiju
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {assets.map((asset) => {
                  const displayUrl = asset.thumb_url || asset.src_url || null;
                  const fallbackUrl = asset.inputs?.image_urls?.[0] || null;
                  
                  return (
                  <Card key={asset.id} className="hover-lift overflow-hidden">
                    <CardContent className="p-0">
                      {/* Media */}
                      <div className="relative aspect-video bg-muted flex items-center justify-center">
                        {asset.status === 'processing' ? (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm font-medium">Obrada u toku…</p>
                            </div>
                          </div>
                        ) : asset.status === 'ready' && !displayUrl ? (
                          <>
                            {fallbackUrl ? (
                              <>
                                <img
                                  src={fallbackUrl}
                                  alt={asset.prompt || 'Image'}
                                  className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-sm flex items-center justify-center p-4">
                                  <div className="text-center text-amber-700 dark:text-amber-300">
                                    <p className="text-xs font-medium">Privremeni prikaz iz izvornog URL-a</p>
                                    <p className="text-xs mt-1">Fajl nije sačuvan u bazu</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="text-center text-amber-700 dark:text-amber-300">
                                  <p className="text-sm font-medium">Greška pri učitavanju</p>
                                  <p className="text-xs mt-1">Fajl nije sačuvan u bazu</p>
                                </div>
                              </div>
                            )}
                          </>
                        ) : displayUrl ? (
                          asset.kind === 'image' ? (
                            <img
                              src={displayUrl}
                              alt={asset.prompt || 'Image'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={displayUrl}
                              poster={asset.thumb_url || ''}
                              controls
                              muted
                              loop
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            Sadržaj nije dostupan
                          </div>
                        )}

                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
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
                        </div>

                        {/* Platform badges */}
                        {asset.posted_to && Array.isArray(asset.posted_to) && asset.posted_to.length > 0 && (
                          <div className="absolute top-3 right-3 flex gap-1">
                            {asset.posted_to.map((platform: string) => (
                              <Badge
                                key={platform}
                                variant="secondary"
                                className="text-xs"
                              >
                                {platformIcons[platform] || platform}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="text-xs text-text-subtle mb-2">
                          {formatDate(asset.created_at)}
                        </div>
                        <p className="text-sm text-text-muted line-clamp-2 mb-4">
                          {getDisplayText(asset)}
                        </p>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            disabled={!displayUrl}
                            onClick={() => handleDownload(asset)}
                            title={!displayUrl ? 'Download će biti omogućen kada se fajl sačuva' : 'Preuzmi'}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Preuzmi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/galerija/${asset.id}`)}
                            title="Prikaži detalje"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
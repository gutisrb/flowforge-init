import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Copy, ArrowLeft, Loader2, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface Video {
  id: string;
  user_id: string;
  status: string;
  video_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  meta: any;
  posted_channels_json: any;
  created_at: string;
  duration_seconds: number | null;
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
  youtube: 'YouTube',
};

const channelStatusColors = {
  posted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const optimizeCloudinaryUrl = (url: string): string => {
  if (!url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto:best,f_auto/');
};

export function GalerijaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const { profile } = useProfile(user);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const fetchVideo = async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('videos')
        .select('id, user_id, status, video_url, thumbnail_url, title, meta, posted_channels_json, created_at, duration_seconds')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      setVideo(data);
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
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const channel = (supabase as any)
      .channel(`video-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${id}`,
        },
        (payload: any) => {
          setVideo(payload.new as Video);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const videoUrl = video?.video_url ? optimizeCloudinaryUrl(video.video_url) : null;
  const description = video?.meta?.description || null;

  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.id}.mp4`;
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
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    toast({
      title: 'Kopirano',
      description: 'URL je kopiran u clipboard',
    });
  };

  const handleCopyDescription = () => {
    if (!description) return;
    navigator.clipboard.writeText(description);
    toast({
      title: 'Kopirano',
      description: 'Opis je kopiran u clipboard',
    });
  };

  const handlePostEverywhere = async () => {
    if (!video || !profile) return;

    setPosting(true);
    try {
      const channels = ['instagram', 'tiktok', 'facebook', 'youtube'];
      const webhookUrl = import.meta.env.VITE_MAKE_POST_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Webhook URL nije konfigurisan');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: video.user_id,
          video_id: video.id,
          channels,
        }),
      });

      if (!response.ok) throw new Error('Greška pri objavljivanju');

      const updatedChannels = channels.reduce((acc, ch) => {
        acc[ch] = 'pending';
        return acc;
      }, {} as Record<string, string>);

      await (supabase as any)
        .from('videos')
        .update({ posted_channels_json: updatedChannels })
        .eq('id', video.id);

      toast({
        title: 'Uspeh',
        description: 'Video je poslat na objavu',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Nije moguće objaviti video',
        variant: 'destructive',
      });
    } finally {
      setPosting(false);
    }
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

  if (!video) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Button variant="ghost" onClick={() => navigate('/app/galerija')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad na galeriju
        </Button>
        <Alert>
          <AlertDescription>Nije pronađeno</AlertDescription>
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

      {video.status === 'processing' && (
        <Alert className="mb-6 border-amber-500/20 bg-amber-500/10">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-600">
            Obrada u toku… obično par minuta. Stranica se automatski osvežava.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    poster={video.thumbnail_url || ''}
                    controls
                    className="w-full h-auto"
                  />
                ) : video.status === 'processing' ? (
                  <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-text-muted">Obrada u toku…</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-20 min-h-[400px] text-muted-foreground">
                    Video nije dostupan
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {description && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Opis</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyDescription}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  statusColors[video.status as keyof typeof statusColors] ||
                  'bg-muted text-muted-foreground'
                }
              >
                {video.status === 'processing'
                  ? 'Obrađuje se'
                  : video.status === 'ready'
                  ? 'Spremno'
                  : 'Greška'}
              </Badge>
            </CardContent>
          </Card>

          {video.posted_channels_json && typeof video.posted_channels_json === 'object' && Object.keys(video.posted_channels_json).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status objave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(video.posted_channels_json).map(([platform, status]: [string, any]) => (
                    <Badge
                      key={platform}
                      className={channelStatusColors[status as keyof typeof channelStatusColors] || 'bg-muted'}
                    >
                      {platformIcons[platform] || platform}: {status}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Akcije</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile?.review_first && video.status === 'ready' && (
                <Button
                  onClick={handlePostEverywhere}
                  className="w-full"
                  disabled={posting}
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Objavi svuda
                </Button>
              )}
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full"
                disabled={!videoUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopiraj URL
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
                disabled={!videoUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Preuzmi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta podaci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {video.title && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Naslov:</span>
                  <span className="text-text-primary font-medium">{video.title}</span>
                </div>
              )}
              {video.duration_seconds && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Trajanje:</span>
                  <span className="text-text-primary font-medium">
                    {formatDuration(video.duration_seconds)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Kreirano:</span>
                <span className="text-text-primary font-medium">{formatDate(video.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
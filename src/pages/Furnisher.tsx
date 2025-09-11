// src/pages/furnisher.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, RotateCcw, Loader2 } from 'lucide-react';
import { MAKE_CREATE_URL, MAKE_STATUS_URL } from '@/config/make';

type JobState = 'processing' | 'done' | 'generating' | 'error';
interface JobStatus { status: JobState; url?: string; message?: string }

export default function Furnisher() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [style, setStyle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [type, setType] = useState<'empty' | 'old'>('empty');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<{ tries: number; nextDelayMs: number } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    setResultImage(null);
  };

  // ---------- Backoff poller ----------
  const pollOnce = async (id: string): Promise<boolean> => {
    const res = await fetch(`${MAKE_STATUS_URL}?jobId=${encodeURIComponent(id)}`, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: abortRef.current?.signal,
    });

    // If Make returns binary directly (your success branch), display it
    const ct = res.headers.get('content-type') || '';
    if (ct.startsWith('image/')) {
      const blob = await res.blob();
      setResultImage(URL.createObjectURL(blob));
      setIsProcessing(false);
      setJobId(null);
      toast({ title: 'Success', description: 'Your image is ready.' });
      return true;
    }

    // Otherwise, expect JSON like {status:'processing'|'generating'|'done', url?}
    const data: JobStatus = await res.json().catch(() => ({ status: 'error' as JobState }));
    if (data.status === 'done' && data.url) {
      setResultImage(data.url);
      setIsProcessing(false);
      setJobId(null);
      toast({ title: 'Success', description: 'Your image is ready.' });
      return true;
    }
    if (data.status === 'error') {
      setIsProcessing(false);
      setJobId(null);
      toast({ title: 'Error', description: data.message || 'Generation failed.', variant: 'destructive' });
      return true; // stop polling
    }
    // status: 'processing' | 'generating' -> keep polling
    return false;
  };

  const pollWithBackoff = async (id: string) => {
    pollingRef.current = { tries: 0, nextDelayMs: 10000 }; // start at 5s
    abortRef.current = new AbortController();

    const MAX_TRIES = 18;        // ~5–6 minutes max
    const MAX_DELAY = 60000;     // cap at 60s
    const FACTOR = 1.6;          // exponential growth
    const JITTER = 0.25;         // +/-25% jitter

    const loop = async () => {
      if (!pollingRef.current) return;
      const done = await pollOnce(id);
      if (done) return;

      pollingRef.current.tries += 1;
      if (pollingRef.current.tries >= MAX_TRIES) {
        setIsProcessing(false);
        setJobId(null);
        toast({ title: 'Timeout', description: 'Still processing. Please try again in a bit.' });
        return;
      }

      const base = Math.min(pollingRef.current.nextDelayMs * FACTOR, MAX_DELAY);
      const jitter = base * (Math.random() * 2 * JITTER - JITTER);
      pollingRef.current.nextDelayMs = Math.round(base + jitter);

      setTimeout(loop, pollingRef.current.nextDelayMs);
    };

    // kick it off after the initial delay (5s)
    setTimeout(loop, pollingRef.current.nextDelayMs);
  };

  // ---------- Actions ----------
  const handleGenerate = async () => {
    if (!selectedFile) return toast({ title: 'Error', description: 'Please select an image.', variant: 'destructive' });
    if (!style.trim()) return toast({ title: 'Error', description: 'Please enter a style.', variant: 'destructive' });

    setIsProcessing(true);
    setResultImage(null);

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('style', style);
      form.append('instructions', instructions);
      form.append('type', type);

      const resp = await fetch(MAKE_CREATE_URL, { method: 'POST', body: form });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json(); // expect {status:'processing', jobId:'...'}
      if (!data?.jobId) throw new Error('Missing jobId');

      setJobId(data.jobId);
      toast({ title: 'Processing', description: 'We\'re furnishing your photo…' });
      await pollWithBackoff(data.jobId);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      toast({ title: 'Error', description: 'Failed to start generation.', variant: 'destructive' });
    }
  };

  const handleRedo = () => {
    setStyle(''); setInstructions(''); setResultImage(null);
    setIsProcessing(false); setJobId(null);
    abortRef.current?.abort(); pollingRef.current = null;
  };

  const handleSave = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = 'furnished.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  useEffect(() => () => { abortRef.current?.abort(); pollingRef.current = null; }, []);

  // ---------- UI ----------
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Furnisher</h1>
          <p className="text-muted-foreground mt-2">Transform your spaces with AI-powered furniture design</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Input Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Image Upload</Label>
                <div className="flex flex-col gap-2">
                  <input ref={fileInputRef} id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect}/>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Select Image'}
                  </Button>
                  {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Selected" className="w-full h-32 object-cover rounded-md" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="npr. moderna, skandi…"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Uputstva</Label>
                <Textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup value={type} onValueChange={(v) => setType(v as 'empty'|'old')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="empty" id="empty"/><Label htmlFor="empty">Empty</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="old" id="old"/><Label htmlFor="old">Old</Label></div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleGenerate} disabled={isProcessing || !selectedFile} className="flex-1">
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />} Generate
                </Button>
                <Button variant="outline" onClick={handleRedo} disabled={isProcessing}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Redo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Result</CardTitle></CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Processing… {jobId ? `#${jobId}` : ''}</p>
                </div>
              ) : resultImage ? (
                <div className="space-y-4">
                  <img src={resultImage} alt="Generated result" className="w-full h-auto rounded-md" />
                  <Button onClick={handleSave} className="w-full"><Download className="h-4 w-4 mr-2" /> Save Image</Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">Generated image will appear here</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

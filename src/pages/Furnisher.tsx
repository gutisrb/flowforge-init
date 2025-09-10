import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, RotateCcw, Loader2 } from 'lucide-react';
import { MAKE_CREATE_URL, MAKE_STATUS_URL } from '@/config/make';

interface JobStatus {
  status: 'processing' | 'done';
  url?: string;
}

export default function Furnisher() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [style, setStyle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [type, setType] = useState('empty');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResultImage(null); // Clear previous result
    }
  };

  const startPolling = (jobId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${MAKE_STATUS_URL}?jobId=${jobId}`);
        
        if (response.headers.get('content-type')?.includes('application/json')) {
          const data: JobStatus = await response.json();
          
          if (data.status === 'done') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setIsProcessing(false);
            setJobId(null);
            
            if (data.url) {
              setResultImage(data.url);
              toast({
                title: "Success",
                description: "Your image has been generated successfully!",
              });
            }
          }
        } else {
          // Response is an image file
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsProcessing(false);
          setJobId(null);
          setResultImage(imageUrl);
          
          toast({
            title: "Success",
            description: "Your image has been generated successfully!",
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        toast({
          title: "Error",
          description: "Failed to check job status. Please try again.",
          variant: "destructive",
        });
        
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsProcessing(false);
        setJobId(null);
      }
    }, 3000);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image first.",
        variant: "destructive",
      });
      return;
    }

    if (!style.trim()) {
      toast({
        title: "Error",
        description: "Please enter a style.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('style', style);
      formData.append('instructions', instructions);
      formData.append('type', type);

      const response = await fetch(MAKE_CREATE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.jobId && data.status === 'processing') {
        setJobId(data.jobId);
        startPolling(data.jobId);
        toast({
          title: "Processing",
          description: "Your image is being generated. Please wait...",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Generate error:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to start image generation. Please check your webhook configuration.",
        variant: "destructive",
      });
    }
  };

  const handleRedo = () => {
    setStyle('');
    setInstructions('');
    setResultImage(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsProcessing(false);
    setJobId(null);
  };

  const handleSave = () => {
    if (!resultImage) return;

    if (resultImage.startsWith('blob:')) {
      // Download blob URL
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open external URL
      window.open(resultImage, '_blank');
    }
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Furnisher</h1>
          <p className="text-muted-foreground mt-2">
            Transform your spaces with AI-powered furniture design
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Input Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Image Upload</Label>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? selectedFile.name : 'Select Image'}
                  </Button>
                  {selectedFile && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Selected"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Style Input */}
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g., Modern minimalist, Vintage industrial..."
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Additional instructions for the AI..."
                  rows={3}
                />
              </div>

              {/* Type Radio */}
              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup value={type} onValueChange={setType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="empty" id="empty" />
                    <Label htmlFor="empty">Empty</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="old" id="old" />
                    <Label htmlFor="old">Old</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isProcessing || !selectedFile}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRedo}
                  disabled={isProcessing}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Redo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Processing your image...</p>
                  {jobId && (
                    <p className="text-xs text-muted-foreground">Job ID: {jobId}</p>
                  )}
                </div>
              ) : resultImage ? (
                <div className="space-y-4">
                  <img
                    src={resultImage}
                    alt="Generated result"
                    className="w-full h-auto rounded-md"
                  />
                  <Button onClick={handleSave} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Save Image
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Generated image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
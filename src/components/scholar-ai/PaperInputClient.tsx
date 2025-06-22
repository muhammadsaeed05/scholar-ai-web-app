'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { extractTextFromFile } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaperInputClientProps {
  paperText: string;
  onPaperTextChange: (text: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export function PaperInputClient({ paperText, onPaperTextChange, onProcess, isProcessing }: PaperInputClientProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      onPaperTextChange(text);
      toast({
        title: "File Processed Successfully",
        description: `Extracted text from ${file.name}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: "File Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
      // Reset file input to allow re-uploading the same file
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <FileText className="h-6 w-6 text-primary" />
          Upload or Paste Research Paper
        </CardTitle>
        <CardDescription>
          Upload a PDF/DOCX file or paste the text content directly below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-upload-input" className="font-semibold">Upload File</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload-input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isExtracting ? (
                  <>
                    <Loader2 className="w-10 h-10 mb-3 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Extracting text...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-muted-foreground">PDF or DOCX files</p>
                  </>
                )}
              </div>
              <input id="file-upload-input" type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} disabled={isExtracting} />
            </label>
          </div>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="relative space-y-2">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground font-semibold">OR</div>
          <div className="border-b w-full"></div>
        </div>


        <div className="space-y-2 pt-2">
          <Label htmlFor="paper-text" className="font-semibold">Paste Paper Content</Label>
          <Textarea
            id="paper-text"
            placeholder="Paste the full text of your research paper here..."
            value={paperText}
            onChange={(e) => onPaperTextChange(e.target.value)}
            rows={15}
            className="min-h-[200px] focus:ring-accent focus:border-accent"
            aria-label="Paper content text area"
            disabled={isExtracting}
          />
        </div>
        <Button onClick={onProcess} disabled={isProcessing || isExtracting || !paperText.trim()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isProcessing ? <Loader2 className="animate-spin" /> : null}
          {isProcessing ? 'Processing...' : 'Process Paper Content'}
        </Button>
      </CardContent>
    </Card>
  );
}

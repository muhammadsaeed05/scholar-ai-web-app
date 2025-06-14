'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaperInputClientProps {
  paperText: string;
  onPaperTextChange: (text: string) => void;
  onProcess: () => void; // Callback when user indicates they are done editing
  isProcessing: boolean;
}

export function PaperInputClient({ paperText, onPaperTextChange, onProcess, isProcessing }: PaperInputClientProps) {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for actual PDF processing. For now, it does nothing.
    // We could show a message here to guide the user to paste text.
    alert("PDF processing is not yet implemented. Please paste the text from your PDF into the text area below.");
    if (event.target) {
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <FileText className="h-6 w-6 text-primary" />
          Upload or Paste Research Paper Content
        </CardTitle>
        <CardDescription>
          Extract text from your research paper PDF and paste it below, or use the (simulated) upload option.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-upload-input" className="font-semibold">Upload PDF (Simulated)</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="pdf-upload-input-actual"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> (feature demonstration)
                </p>
                <p className="text-xs text-muted-foreground">PDF files only</p>
              </div>
              <input id="pdf-upload-input-actual" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>
           <p className="text-xs text-center text-muted-foreground mt-1">Currently, PDF parsing is simulated. Please paste your text directly.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paper-text" className="font-semibold">Paste Paper Content Here</Label>
          <Textarea
            id="paper-text"
            placeholder="Paste the full text of your research paper here..."
            value={paperText}
            onChange={(e) => onPaperTextChange(e.target.value)}
            rows={15}
            className="min-h-[200px] focus:ring-accent focus:border-accent"
            aria-label="Paper content text area"
          />
        </div>
        <Button onClick={onProcess} disabled={isProcessing || !paperText.trim()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isProcessing ? 'Processing...' : 'Process Paper Content'}
        </Button>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleReformatPaper, handleGenerateDocx } from '@/app/actions';
import { extractTextFromFile } from '@/lib/utils';
import { FileCog, Loader2, UploadCloud, FileText, FileType } from 'lucide-react';
import jsPDF from 'jspdf';

interface TemplatingSectionClientProps {
  paperText: string;
}

type TemplateFormat = 'IEEE' | 'APA' | 'ACM' | 'Custom';

export function TemplatingSectionClient({ paperText }: TemplatingSectionClientProps) {
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat | ''>('');
  const [customTemplateContent, setCustomTemplateContent] = useState<string | null>(null);
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCustomTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setCustomTemplateName(null);
    setCustomTemplateContent(null);
    try {
      const text = await extractTextFromFile(file);
      setCustomTemplateContent(text);
      setCustomTemplateName(file.name);
      setSelectedFormat('Custom');
      toast({ title: 'Custom template loaded', description: `Loaded structure from ${file.name}.` });
    } catch (error) {
      toast({ title: 'Template Error', description: error instanceof Error ? error.message : 'Could not read template file.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleGenerateClick = async () => {
    if (!paperText.trim()) {
      toast({ title: 'Input Error', description: 'Paper content is empty.', variant: 'destructive' });
      return;
    }
    if (!selectedFormat) {
      toast({ title: 'Input Error', description: 'Please select a template format.', variant: 'destructive' });
      return;
    }
    if (selectedFormat === 'Custom' && !customTemplateContent) {
      toast({ title: 'Input Error', description: 'Please upload a custom template file.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setGeneratedHtml('');
    try {
      const result = await handleReformatPaper({
        paperContent: paperText,
        templateFormat: selectedFormat,
        ...(selectedFormat === 'Custom' && { customTemplateContent: customTemplateContent! }),
      });

      if (result.error) {
        toast({ title: 'Generation Error', description: result.error, variant: 'destructive' });
      } else if (result.data?.htmlContent) {
        setGeneratedHtml(result.data.htmlContent);
        toast({ title: 'Success', description: `Paper reformatted to ${selectedFormat} style!` });
      }
    } catch (error) {
      toast({ title: 'Generation Failed', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    toast({ title: "Generating PDF...", description: "This may take a moment." });
    const pdf = new jsPDF('p', 'pt', 'a4');
    await pdf.html(previewRef.current, {
        callback: (doc) => {
            doc.save('scholarai-formatted-paper.pdf');
        },
        margin: [40, 40, 40, 40],
        autoPaging: 'text',
        width: 515, // A4 width in points (595) minus margins
        windowWidth: previewRef.current.scrollWidth,
    });
  };

  const handleDownloadDocx = async () => {
    if (!generatedHtml) return;
    toast({ title: "Generating DOCX...", description: "Please wait." });
    try {
        const result = await handleGenerateDocx(generatedHtml);

        if (result.error) {
            toast({ title: "DOCX Generation Error", description: result.error, variant: 'destructive' });
            return;
        }

        if (result.data) {
            const byteCharacters = atob(result.data.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'scholarai-formatted-paper.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    } catch(e) {
        toast({ title: "DOCX Generation Failed", description: "An unexpected error occurred.", variant: 'destructive' });
        console.error("Error generating docx:", e);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <FileCog className="h-6 w-6 text-primary" />
          AI Paper Templating & Reformatting
        </CardTitle>
        <CardDescription>
          Reformat your paper using standard templates or upload your own.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="template-format">1. Select Standard Format</Label>
            <Select
                value={selectedFormat}
                onValueChange={(value) => setSelectedFormat(value as TemplateFormat)}
                disabled={isLoading}
            >
                <SelectTrigger id="template-format" aria-label="Select template format">
                <SelectValue placeholder="Choose a format..." />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="IEEE">IEEE</SelectItem>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="ACM">ACM</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
            <Label htmlFor="custom-template-upload">2. Or Upload Custom Template</Label>
                <label
                    htmlFor="custom-template-upload-input"
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
                    >
                    <UploadCloud className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customTemplateName || "Upload PDF or DOCX"}</span>
                </label>
                <input id="custom-template-upload-input" type="file" className="hidden" accept=".pdf,.docx" onChange={handleCustomTemplateUpload} disabled={isLoading}/>
            </div>
        </div>

        <Button onClick={handleGenerateClick} disabled={isLoading || !paperText.trim() || !selectedFormat} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Reformatting...' : 'Convert to Selected Template'}
        </Button>
        
        {generatedHtml && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Formatted Paper Preview:</h3>
            <ScrollArea className="h-96 w-full rounded-md border bg-muted/30">
                <div 
                    ref={previewRef} 
                    className="prose prose-sm max-w-none p-4" 
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                />
            </ScrollArea>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleDownloadPdf} className="flex-1">
                    <FileType className="mr-2 h-4 w-4" /> Download as PDF
                </Button>
                <Button variant="outline" onClick={handleDownloadDocx} className="flex-1">
                    <FileText className="mr-2 h-4 w-4" /> Download as DOCX
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateTemplate } from '@/app/actions';
import { FileCog, Loader2 } from 'lucide-react';

interface TemplateGeneratorSectionClientProps {
  paperText: string;
}

type TemplateFormat = 'IEEE' | 'APA' | 'ACM';

export function TemplateGeneratorSectionClient({ paperText }: TemplateGeneratorSectionClientProps) {
  const [template, setTemplate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateTemplateClick = async () => {
    if (!paperText.trim()) {
      toast({ title: "Input Error", description: "Paper content is empty.", variant: "destructive" });
      return;
    }
    if (!selectedFormat) {
      toast({ title: "Input Error", description: "Please select a template format.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTemplate('');
    try {
      const result = await handleGenerateTemplate(paperText, selectedFormat);
      if (result.error) {
        toast({ title: "Template Generation Error", description: result.error, variant: "destructive" });
      } else if (result.data?.template) {
        setTemplate(result.data.template);
        toast({ title: "Success", description: `${selectedFormat} template generated!` });
      }
    } catch (error) {
      toast({ title: "Template Generation Failed", description: "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <FileCog className="h-6 w-6 text-primary" />
          Template Generator
        </CardTitle>
        <CardDescription>
          Generate a research paper template in common formats.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-format">Select Format</Label>
          <Select 
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value as TemplateFormat)}
            disabled={isLoading}
          >
            <SelectTrigger id="template-format" className="w-full" aria-label="Select template format">
              <SelectValue placeholder="Choose a format (e.g., IEEE, APA)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IEEE">IEEE</SelectItem>
              <SelectItem value="APA">APA</SelectItem>
              <SelectItem value="ACM">ACM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerateTemplateClick} disabled={isLoading || !paperText.trim() || !selectedFormat} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Generating...' : 'Generate Template'}
        </Button>
        {template && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Generated {selectedFormat} Template:</h3>
            <ScrollArea className="h-64 w-full rounded-md border p-3 bg-muted/50">
              <pre className="text-sm whitespace-pre-wrap font-mono">{template}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

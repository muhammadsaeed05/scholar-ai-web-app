'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { handleSuggestFormatting } from '@/app/actions';
import { ListChecks, Loader2 } from 'lucide-react';

interface FormattingSuggestionsSectionClientProps {
  paperText: string;
}

export function FormattingSuggestionsSectionClient({ paperText }: FormattingSuggestionsSectionClientProps) {
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestFormattingClick = async () => {
    if (!paperText.trim()) {
      toast({ title: "Input Error", description: "Paper content is empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestions('');
    try {
      const result = await handleSuggestFormatting(paperText);
      if (result.error) {
        toast({ title: "Formatting Suggestion Error", description: result.error, variant: "destructive" });
      } else if (result.data?.suggestions) {
        setSuggestions(result.data.suggestions);
        toast({ title: "Success", description: "Formatting suggestions generated!" });
      }
    } catch (error) {
      toast({ title: "Suggestion Failed", description: "An unexpected error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ListChecks className="h-6 w-6 text-primary" />
          Formatting Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions for formatting your research paper.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSuggestFormattingClick} disabled={isLoading || !paperText.trim()} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Generating...' : 'Get Formatting Suggestions'}
        </Button>
        {suggestions && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Suggestions:</h3>
            <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/50">
              <pre className="text-sm whitespace-pre-wrap font-sans">{suggestions}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

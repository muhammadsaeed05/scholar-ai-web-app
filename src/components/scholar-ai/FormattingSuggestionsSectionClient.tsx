
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { handleSuggestFormatting } from '@/app/actions';
import { ListChecks, Loader2, ClipboardCopy, ChevronDown, ChevronUp } from 'lucide-react';

interface FormattingSuggestionsSectionClientProps {
  paperText: string;
}

interface SuggestionSection {
  title: string;
  content: string;
}

export function FormattingSuggestionsSectionClient({ paperText }: FormattingSuggestionsSectionClientProps) {
  const [suggestions, setSuggestions] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSuggestFormattingClick = async () => {
    if (!paperText.trim()) {
      toast({ title: "Input Error", description: "Paper content is empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    setOpenAccordionItems([]); 
    try {
      const result = await handleSuggestFormatting(paperText);
      if (result.error) {
        toast({ title: "Formatting Suggestion Error", description: result.error, variant: "destructive" });
      } else if (result.data?.suggestions) {
        const receivedSuggestions = result.data.suggestions;
        if (Object.keys(receivedSuggestions).length > 0) {
          setSuggestions(receivedSuggestions);
          // Automatically open the first few items, or all if few.
          setOpenAccordionItems(Object.keys(receivedSuggestions).slice(0, 3));
          toast({ title: "Success", description: "Formatting suggestions generated!" });
        } else {
          setSuggestions({}); // Set to empty object to indicate no suggestions found
          toast({ title: "No Suggestions", description: "No specific formatting suggestions could be generated for the provided text." });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({ title: "Suggestion Failed", description: errorMessage, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text: string, sectionTitle: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: "Copied!", description: `${sectionTitle} content copied to clipboard.` });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
        console.error('Failed to copy: ', err);
      });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ListChecks className="h-6 w-6 text-primary" />
          Formatting Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions for formatting sections of your research paper.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSuggestFormattingClick} 
          disabled={isLoading || !paperText.trim()} 
          className="w-full"
          aria-label="Get formatting suggestions for the paper content"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Generating Suggestions...' : 'Get Formatting Suggestions'}
        </Button>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Fetching suggestions...</p>
          </div>
        )}

        {suggestions && Object.keys(suggestions).length > 0 && !isLoading && (
          <Accordion 
            type="multiple" 
            className="w-full space-y-2"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
          >
            {Object.entries(suggestions).map(([key, content]) => (
              <AccordionItem value={key} key={key} className="border bg-card rounded-md shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="px-4 py-3 text-left hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-primary">{capitalizeFirstLetter(key.replace(/_/g, ' '))}</span>
                    {/* Chevron is part of AccordionTrigger now */}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap">{content}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(content, capitalizeFirstLetter(key))}
                    className="mt-2"
                    aria-label={`Copy suggestion for ${key}`}
                  >
                    <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Suggestion
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {suggestions && Object.keys(suggestions).length === 0 && !isLoading && (
           <div className="text-center py-6">
            <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No specific formatting suggestions were generated based on the provided content.</p>
            <p className="text-xs text-muted-foreground mt-1">Try providing more detailed paper content.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

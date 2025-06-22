'use client';

import { useState } from 'react';
import { ScholarAiHeader } from '@/components/scholar-ai/ScholarAiHeader';
import { PaperInputClient } from '@/components/scholar-ai/PaperInputClient';
import { SummarizationSectionClient } from '@/components/scholar-ai/SummarizationSectionClient';
import { FormattingSuggestionsSectionClient } from '@/components/scholar-ai/FormattingSuggestionsSectionClient';
import { TemplatingSectionClient } from '@/components/scholar-ai/TemplateGeneratorSectionClient';
import { ChatbotSectionClient } from '@/components/scholar-ai/ChatbotSectionClient';
import { Separator } from '@/components/ui/separator';

export default function ScholarAiPage() {
  const [paperText, setPaperText] = useState<string>('');
  const [currentSummary, setCurrentSummary] = useState<string>('');
  const [isPaperProcessed, setIsPaperProcessed] = useState<boolean>(false);
  const [isProcessingPaper, setIsProcessingPaper] = useState<boolean>(false); // For initial processing indication

  const handlePaperTextChange = (text: string) => {
    setPaperText(text);
    if (isPaperProcessed) { // If paper was already "processed", reset this state if text changes
        setIsPaperProcessed(false);
    }
  };

  const handleSummaryGenerated = (summary: string) => {
    setCurrentSummary(summary);
  };
  
  const handleProcessPaper = () => {
    if(paperText.trim()){
        setIsProcessingPaper(true);
        // Simulate a short processing time, or this could be an actual async validation/preprocessing step
        setTimeout(() => {
            setIsPaperProcessed(true);
            setIsProcessingPaper(false);
        }, 500); 
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScholarAiHeader />
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Paper Input */}
          <div className="lg:col-span-1 space-y-6">
            <PaperInputClient 
              paperText={paperText} 
              onPaperTextChange={handlePaperTextChange}
              onProcess={handleProcessPaper}
              isProcessing={isProcessingPaper}
            />
          </div>

          {/* Right Column: Feature Sections */}
          <div className="lg:col-span-2 space-y-6">
            {isPaperProcessed ? (
              <>
                <SummarizationSectionClient 
                    paperText={paperText} 
                    onSummaryGenerated={handleSummaryGenerated}
                    currentSummary={currentSummary} 
                />
                <Separator className="my-6" />
                <FormattingSuggestionsSectionClient paperText={paperText} />
                <Separator className="my-6" />
                <TemplatingSectionClient paperText={paperText} />
                <Separator className="my-6" />
                <ChatbotSectionClient paperText={paperText} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 border border-dashed rounded-lg bg-card text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb text-muted-foreground mb-4"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6.5 14"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                <h2 className="text-xl font-semibold text-foreground mb-2">Unlock AI Features</h2>
                <p className="text-muted-foreground">
                  Please paste your research paper content and click "Process Paper Content" to enable summarization, formatting suggestions, template generation, and the chatbot.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="py-4 px-6 border-t mt-auto">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ScholarAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { handleSummarize } from '@/app/actions';
import { BookOpenText, Volume2, Play, Pause, StopCircle, Loader2 } from 'lucide-react';

interface SummarizationSectionClientProps {
  paperText: string;
  onSummaryGenerated: (summary: string) => void;
  currentSummary: string;
}

export function SummarizationSectionClient({ paperText, onSummaryGenerated, currentSummary }: SummarizationSectionClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleSummarizeClick = async () => {
    if (!paperText.trim()) {
      toast({ title: "Input Error", description: "Paper content is empty. Please paste your paper first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    stopSpeech(); // Stop any ongoing speech before generating new summary
    try {
      const result = await handleSummarize(paperText);
      if (result.error) {
        toast({ title: "Summarization Error", description: result.error, variant: "destructive" });
        onSummaryGenerated('');
      } else if (result.data?.summary) {
        onSummaryGenerated(result.data.summary);
        toast({ title: "Success", description: "Paper summarized successfully!" });
      }
    } catch (error) {
      toast({ title: "Summarization Failed", description: "An unexpected error occurred.", variant: "destructive" });
      onSummaryGenerated('');
    }
    setIsLoading(false);
  };

  const setupUtterance = useCallback(() => {
    if (!speechSynthesis || !currentSummary) return null;

    const newUtterance = new SpeechSynthesisUtterance(currentSummary);
    newUtterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    newUtterance.onpause = () => {
      setIsSpeaking(false);
      setIsPaused(true);
    };
    newUtterance.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    newUtterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    newUtterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      toast({ title: "TTS Error", description: `Speech synthesis error: ${event.error}`, variant: "destructive" });
      setIsSpeaking(false);
      setIsPaused(false);
    };
    setUtterance(newUtterance);
    return newUtterance;
  }, [speechSynthesis, currentSummary, toast]);

  useEffect(() => {
    // Re-setup utterance if summary changes and speech synthesis is available
     if (speechSynthesis && currentSummary) {
        setupUtterance();
     }
  }, [currentSummary, speechSynthesis, setupUtterance]);


  const playSpeech = () => {
    if (!speechSynthesis || !currentSummary) return;
    if (speechSynthesis.speaking && isPaused) {
      speechSynthesis.resume();
    } else if (!speechSynthesis.speaking) {
      const utt = utterance || setupUtterance();
      if (utt) speechSynthesis.speak(utt);
    }
  };

  const pauseSpeech = () => {
    if (speechSynthesis?.speaking && !isPaused) {
      speechSynthesis.pause();
    }
  };

  const stopSpeech = () => {
    if (speechSynthesis?.speaking) {
      speechSynthesis.cancel(); // This also triggers onend
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };
  
  useEffect(() => {
    return () => {
      // Cleanup: cancel speech synthesis when component unmounts
      if (speechSynthesis?.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookOpenText className="h-6 w-6 text-primary" />
          AI Summarization & Text-to-Speech
        </CardTitle>
        <CardDescription>
          Generate a concise summary of your paper and listen to it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSummarizeClick} disabled={isLoading || !paperText.trim()} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Summarizing...' : 'Summarize Paper'}
        </Button>
        {currentSummary && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Summary:</h3>
            <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/50">
              <p className="text-sm whitespace-pre-wrap">{currentSummary}</p>
            </ScrollArea>
            <div className="flex items-center gap-2 pt-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Text-to-Speech:</h4>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={playSpeech} disabled={!currentSummary || (isSpeaking && !isPaused) || !speechSynthesis}>
                <Play className="mr-1 h-4 w-4" /> Play
              </Button>
              <Button variant="outline" size="sm" onClick={pauseSpeech} disabled={!isSpeaking || isPaused || !speechSynthesis}>
                <Pause className="mr-1 h-4 w-4" /> Pause
              </Button>
              <Button variant="outline" size="sm" onClick={stopSpeech} disabled={!isSpeaking && !isPaused || !speechSynthesis}>
                <StopCircle className="mr-1 h-4 w-4" /> Stop
              </Button>
            </div>
             {!speechSynthesis && <p className="text-xs text-destructive">Text-to-Speech is not supported or enabled in your browser.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

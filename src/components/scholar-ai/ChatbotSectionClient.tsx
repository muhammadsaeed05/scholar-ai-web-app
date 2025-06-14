'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { handleChat } from '@/app/actions';
import { MessageSquare, User, Bot, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatbotSectionClientProps {
  paperText: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export function ChatbotSectionClient({ paperText }: ChatbotSectionClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;
    if (!paperText.trim()) {
      toast({ title: "Chat Error", description: "Paper content is empty. Cannot ask questions.", variant: "destructive" });
      return;
    }

    const newUserMessage: Message = { id: Date.now().toString(), text: userInput, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await handleChat(paperText, newUserMessage.text);
      if (result.error) {
        toast({ title: "Chatbot Error", description: result.error, variant: "destructive" });
        const aiErrorMessage: Message = { id: Date.now().toString() + '_error', text: "Sorry, I couldn't process that. " + result.error, sender: 'ai' };
        setMessages(prev => [...prev, aiErrorMessage]);
      } else if (result.data?.answer) {
        const aiResponseMessage: Message = { id: Date.now().toString() + '_ai', text: result.data.answer, sender: 'ai' };
        setMessages(prev => [...prev, aiResponseMessage]);
      }
    } catch (error) {
      toast({ title: "Chatbot Failed", description: "An unexpected error occurred.", variant: "destructive" });
      const aiErrorMessage: Message = { id: Date.now().toString() + '_fail', text: "Sorry, an unexpected error occurred while trying to get an answer.", sender: 'ai' };
      setMessages(prev => [...prev, aiErrorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <MessageSquare className="h-6 w-6 text-primary" />
          Contextual Chatbot
        </CardTitle>
        <CardDescription>
          Ask questions about the uploaded research paper.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col h-[500px]">
        <ScrollArea className="flex-grow h-full border rounded-md p-4 bg-muted/30" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[70%] p-3 rounded-xl ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border' 
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex justify-start gap-3">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%] p-3 rounded-xl bg-card border flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
            )}
            {messages.length === 0 && !isLoading && (
              <p className="text-sm text-center text-muted-foreground py-8">
                Ask a question about the paper content to start the chat.
              </p>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
          <Input
            type="text"
            placeholder="Ask a question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading || !paperText.trim()}
            className="flex-grow"
            aria-label="Chat input"
          />
          <Button type="submit" disabled={isLoading || !userInput.trim() || !paperText.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

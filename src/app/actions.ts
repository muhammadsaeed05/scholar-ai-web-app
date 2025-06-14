'use server';

import { summarizeResearchPaper, type SummarizeResearchPaperInput } from '@/ai/flows/summarize-research-paper';
import { suggestFormatting, type SuggestFormattingInput } from '@/ai/flows/suggest-formatting';
import { generatePaperTemplate, type GeneratePaperTemplateInput } from '@/ai/flows/generate-paper-template';
import { contextualChatbot, type ContextualChatbotInput } from '@/ai/flows/contextual-chatbot';

export async function handleSummarize(paperText: string) {
  if (!paperText.trim()) {
    return { data: null, error: "Paper content cannot be empty." };
  }
  try {
    const input: SummarizeResearchPaperInput = { pdfText: paperText };
    const result = await summarizeResearchPaper(input);
    return { data: { summary: result.summary }, error: null };
  } catch (e) {
    console.error("Error in handleSummarize:", e);
    return { data: null, error: "Failed to summarize paper. Please try again." };
  }
}

export async function handleSuggestFormatting(paperText: string) {
  if (!paperText.trim()) {
    return { data: null, error: "Paper content cannot be empty." };
  }
  try {
    const input: SuggestFormattingInput = { paperContent: paperText };
    const result = await suggestFormatting(input);
    return { data: { suggestions: result.formattingSuggestions }, error: null };
  } catch (e) {
    console.error("Error in handleSuggestFormatting:", e);
    return { data: null, error: "Failed to get formatting suggestions. Please try again." };
  }
}

export async function handleGenerateTemplate(paperText: string, format: 'IEEE' | 'APA' | 'ACM') {
  if (!paperText.trim()) {
    return { data: null, error: "Paper content cannot be empty." };
  }
  if (!format) {
    return { data: null, error: "Template format must be selected." };
  }
  try {
    const input: GeneratePaperTemplateInput = { paperContent: paperText, format };
    const result = await generatePaperTemplate(input);
    return { data: { template: result.template }, error: null };
  } catch (e) {
    console.error("Error in handleGenerateTemplate:", e);
    return { data: null, error: "Failed to generate template. Please try again." };
  }
}

export async function handleChat(paperText: string, question: string) {
  if (!paperText.trim()) {
    return { data: null, error: "Paper content cannot be empty to ask questions." };
  }
  if (!question.trim()) {
    return { data: null, error: "Question cannot be empty." };
  }
  try {
    const input: ContextualChatbotInput = { paperText, question };
    const result = await contextualChatbot(input);
    return { data: { answer: result.answer }, error: null };
  } catch (e) {
    console.error("Error in handleChat:", e);
    return { data: null, error: "Failed to get answer from chatbot. Please try again." };
  }
}

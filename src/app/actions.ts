
'use server';

import { summarizeResearchPaper, type SummarizeResearchPaperInput } from '@/ai/flows/summarize-research-paper';
import { suggestFormatting, type SuggestFormattingInput, type SuggestFormattingOutput } from '@/ai/flows/suggest-formatting';
import { reformatPaperContent, type ReformatPaperContentInput } from '@/ai/flows/generate-paper-template';
import { contextualChatbot, type ContextualChatbotInput } from '@/ai/flows/contextual-chatbot';
import htmlToDocx from 'html-to-docx';

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

export async function handleSuggestFormatting(paperText: string): Promise<{ data: {suggestions: SuggestFormattingOutput['suggestions']} | null; error: string | null; }> {
  if (!paperText.trim()) {
    return { data: null, error: "Paper content cannot be empty." };
  }
  try {
    const input: SuggestFormattingInput = { paperContent: paperText };
    const result: SuggestFormattingOutput = await suggestFormatting(input);
    return { data: { suggestions: result.suggestions || [] }, error: null };
  } catch (e) {
    console.error("Error in handleSuggestFormatting:", e);
    const errorMessage = e instanceof Error ? e.message : "Failed to get formatting suggestions. Please try again.";
    return { data: null, error: errorMessage };
  }
}

export async function handleReformatPaper(input: ReformatPaperContentInput) {
  if (!input.paperContent.trim()) {
    return { data: null, error: "Paper content cannot be empty." };
  }
  if (!input.templateFormat) {
    return { data: null, error: "Template format must be selected." };
  }
  try {
    const result = await reformatPaperContent(input);
    return { data: { htmlContent: result.reformattedContent }, error: null };
  } catch (e) {
    console.error("Error in handleReformatPaper:", e);
    return { data: null, error: "Failed to generate formatted paper. Please try again." };
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

export async function handleGenerateDocx(htmlContent: string) {
  if (!htmlContent) {
    return { data: null, error: "HTML content is empty." };
  }

  try {
    const fileBuffer = await htmlToDocx(htmlContent, undefined, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
    
    const base64 = (fileBuffer as Buffer).toString('base64');
    
    return { data: { base64 }, error: null };
  } catch (e) {
    console.error("Error in handleGenerateDocx:", e);
    return { data: null, error: "Failed to generate DOCX file. Please try again." };
  }
}

// src/ai/flows/suggest-formatting.ts
'use server';

/**
 * @fileOverview Formatting suggestion flow for research papers.
 *
 * This file defines a Genkit flow that analyzes the content and structure of a research paper
 * to provide formatting suggestions, including section headings and appropriate styles.
 *
 * @exports suggestFormatting - The main function to trigger the formatting suggestion flow.
 * @exports SuggestFormattingInput - The input type for the suggestFormatting function.
 * @exports SuggestFormattingOutput - The output type for the suggestFormatting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestFormattingInputSchema = z.object({
  paperContent: z
    .string()
    .describe('The extracted text content of the research paper.'),
});

export type SuggestFormattingInput = z.infer<typeof SuggestFormattingInputSchema>;

// Define the output schema
const SuggestFormattingOutputSchema = z.object({
  formattingSuggestions: z
    .string()
    .describe(
      'A list of formatting suggestions for the research paper, including section headings and appropriate styles.'
    ),
});

export type SuggestFormattingOutput = z.infer<typeof SuggestFormattingOutputSchema>;

// Define the main function
export async function suggestFormatting(input: SuggestFormattingInput): Promise<SuggestFormattingOutput> {
  return suggestFormattingFlow(input);
}

// Define the prompt
const suggestFormattingPrompt = ai.definePrompt({
  name: 'suggestFormattingPrompt',
  input: {schema: SuggestFormattingInputSchema},
  output: {schema: SuggestFormattingOutputSchema},
  prompt: `You are an AI assistant specialized in providing formatting suggestions for research papers.

  Analyze the following research paper content and suggest appropriate formatting, including section headings and styles based on common academic standards (e.g., IEEE, APA, ACM).

  Research Paper Content:
  {{paperContent}}

  Formatting Suggestions:
  `, 
});

// Define the flow
const suggestFormattingFlow = ai.defineFlow(
  {
    name: 'suggestFormattingFlow',
    inputSchema: SuggestFormattingInputSchema,
    outputSchema: SuggestFormattingOutputSchema,
  },
  async input => {
    const {output} = await suggestFormattingPrompt(input);
    return output!;
  }
);

// src/ai/flows/suggest-formatting.ts
'use server';

/**
 * @fileOverview Formatting suggestion flow for research papers.
 *
 * This file defines a Genkit flow that analyzes the content and structure of a research paper
 * to provide formatting suggestions as a structured JSON object, where keys are section names
 * (e.g., "introduction", "methodology") and values are the corresponding suggestions.
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
  suggestedSections: z
    .record(z.string(), z.string())
    .describe(
      'A JSON object where keys are lowercase section names (e.g., "introduction", "methodology") and values are the suggested content or structure for that section.'
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

  Analyze the following research paper content. Based on the content, identify common academic sections (like Introduction, Methodology, Results, Discussion, Conclusion, Abstract, References, etc.).

  For each identified section, provide a brief suggestion for its content or structure.

  Return your suggestions as a JSON object where each key is the lowercase name of the section (e.g., "introduction", "methodology") and the value is the suggested text for that section.

  Example Output:
  {
    "abstract": "A concise summary of the paper's objectives, methods, key findings, and conclusions.",
    "introduction": "Provide background information, state the problem, and outline the paper's objectives and scope.",
    "methodology": "Describe the research design, data collection methods, and analytical techniques used in detail."
  }

  If a section is not applicable or cannot be determined from the content, do not include it in the JSON object. Ensure the output is a valid JSON object.

  Research Paper Content:
  {{paperContent}}
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
    // Ensure the output is not null, and if it's an empty object, it's still valid.
    return output || { suggestedSections: {} };
  }
);

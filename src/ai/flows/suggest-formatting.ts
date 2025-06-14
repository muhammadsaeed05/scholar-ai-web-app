// src/ai/flows/suggest-formatting.ts
'use server';

/**
 * @fileOverview Formatting suggestion flow for research papers.
 *
 * This file defines a Genkit flow that analyzes the content and structure of a research paper
 * to provide formatting suggestions as an array of objects, where each object contains
 * a section name and the corresponding suggestion.
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

// Define the schema for a single suggestion
const SectionSuggestionSchema = z.object({
  sectionName: z
    .string()
    .describe(
      'The lowercase name of the identified section (e.g., "introduction", "methodology").'
    ),
  suggestion: z
    .string()
    .describe('The suggested content or structure for this section.'),
});

// Define the output schema
const SuggestFormattingOutputSchema = z.object({
  suggestions: z
    .array(SectionSuggestionSchema)
    .describe(
      'An array of objects, where each object represents a formatting suggestion for a specific section of the paper.'
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

  Return your suggestions as a JSON object with a top-level key "suggestions".
  The value of "suggestions" must be an array of objects. Each object in the array must have two keys:
  1. "sectionName": A string representing the lowercase name of the section (e.g., "introduction", "methodology").
  2. "suggestion": A string containing the suggested content or structure for that section.

  Example Output:
  {
    "suggestions": [
      {
        "sectionName": "abstract",
        "suggestion": "A concise summary of the paper's objectives, methods, key findings, and conclusions."
      },
      {
        "sectionName": "introduction",
        "suggestion": "Provide background information, state the problem, and outline the paper's objectives and scope."
      },
      {
        "sectionName": "methodology",
        "suggestion": "Describe the research design, data collection methods, and analytical techniques used in detail."
      }
    ]
  }

  If no sections are applicable or cannot be determined from the content, the "suggestions" array should be empty (e.g., []).
  Ensure the overall output is a valid JSON object matching this structure.

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
    // Ensure the output is not null, and if suggestions array is missing, default to empty array.
    return output || { suggestions: [] };
  }
);

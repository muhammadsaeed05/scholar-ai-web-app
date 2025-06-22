'use server';

/**
 * @fileOverview A flow to reformat research paper content based on a template.
 *
 * - reformatPaperContent - A function that reformats paper content.
 * - ReformatPaperContentInput - The input type for the function.
 * - ReformatPaperContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReformatPaperContentInputSchema = z.object({
  paperContent: z.string().describe('The original content of the research paper.'),
  templateFormat: z
    .string()
    .describe('The standard template format (e.g., IEEE, APA, ACM) or "Custom".'),
  customTemplateContent: z
    .string()
    .optional()
    .describe(
      'The text content of a custom template file. Used if templateFormat is "Custom".'
    ),
});
export type ReformatPaperContentInput = z.infer<typeof ReformatPaperContentInputSchema>;

const ReformatPaperContentOutputSchema = z.object({
  reformattedContent: z
    .string()
    .describe(
      'The reformatted paper content as an HTML string, using basic tags like <h1>, <h2>, <p>, <ul>, <li>.'
    ),
});
export type ReformatPaperContentOutput = z.infer<typeof ReformatPaperContentOutputSchema>;

export async function reformatPaperContent(
  input: ReformatPaperContentInput
): Promise<ReformatPaperContentOutput> {
  return reformatPaperContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reformatPaperContentPrompt',
  input: {schema: ReformatPaperContentInputSchema},
  output: {schema: ReformatPaperContentOutputSchema},
  prompt: `You are an expert academic editor. Your task is to reformat the provided 'Paper Content' to match the specified 'Template Format'.

  - If a 'Custom Template Content' is provided, use its structure, headings, and style as the primary guide for reformatting.
  - If a standard format (like IEEE, APA, ACM) is specified, adhere to its common structural and citation conventions.
  - Structure the output as a single, clean HTML string. Use only basic semantic HTML tags: <h1> for the main title, <h2> for section headers, <p> for paragraphs, <ul> and <li> for lists. Do not include <head>, <body>, or any styling.

  Template Format: {{{templateFormat}}}
  {{#if customTemplateContent}}
  Custom Template Content (for structure reference): {{{customTemplateContent}}}
  {{/if}}

  Original Paper Content to Reformat:
  {{{paperContent}}}
  `,
});

const reformatPaperContentFlow = ai.defineFlow(
  {
    name: 'reformatPaperContentFlow',
    inputSchema: ReformatPaperContentInputSchema,
    outputSchema: ReformatPaperContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

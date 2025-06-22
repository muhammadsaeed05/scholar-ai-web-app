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
  prompt: `You are a meticulous, AI-powered typesetter. Your sole purpose is to reformat a given research paper's text to perfectly match the structure and style of a provided template. You must NOT alter the original wording, only the formatting.

**Instructions:**

1.  **Analyze the Template:**
    - If a 'Custom Template Content' is provided, analyze its structure, heading levels (h1, h2, etc.), paragraph breaks, and overall flow. This is your primary guide.
    - If a standard format (IEEE, APA, ACM) is given, replicate the typical structure for that format (e.g., Title, Abstract, Introduction, two-column layouts for IEEE if possible with HTML, etc.).

2.  **Reformat the Paper Content:**
    - Take the 'Original Paper Content' and meticulously place it into the structure derived from the template.
    - Match heading levels exactly. If the template uses <h1> for the title and <h2> for sections, do the same.
    - Preserve all original text, equations, and data from the user's paper. Do not summarize, rephrase, or omit any content.

3.  **Output Format:**
    - Generate a **single, clean HTML string**.
    - Use only basic semantic HTML tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>.
    - **Do NOT include** \`<html>\`, \`<head>\`, \`<body>\`, \`<style>\`, or any CSS attributes (\`style="..."\`). The output must be pure structural HTML.

**Template to Emulate:**
Template Format: {{{templateFormat}}}
{{#if customTemplateContent}}
Custom Template Content for Structural Reference:
---
{{{customTemplateContent}}}
---
{{/if}}

**Content to Reformat:**
Original Paper Content:
---
{{{paperContent}}}
---
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

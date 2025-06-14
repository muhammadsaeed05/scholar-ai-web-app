'use server';

/**
 * @fileOverview Template generation flow for research papers.
 *
 * - generatePaperTemplate - A function that generates a template for a research paper.
 * - GeneratePaperTemplateInput - The input type for the generatePaperTemplate function.
 * - GeneratePaperTemplateOutput - The return type for the generatePaperTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaperTemplateInputSchema = z.object({
  format: z
    .enum(['IEEE', 'APA', 'ACM'])
    .describe('The desired research paper format (IEEE, APA, or ACM).'),
  paperContent: z.string().describe('The extracted text content from the research paper.'),
});
export type GeneratePaperTemplateInput = z.infer<typeof GeneratePaperTemplateInputSchema>;

const GeneratePaperTemplateOutputSchema = z.object({
  template: z.string().describe('The generated research paper template.'),
});
export type GeneratePaperTemplateOutput = z.infer<typeof GeneratePaperTemplateOutputSchema>;

export async function generatePaperTemplate(input: GeneratePaperTemplateInput): Promise<GeneratePaperTemplateOutput> {
  return generatePaperTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaperTemplatePrompt',
  input: {schema: GeneratePaperTemplateInputSchema},
  output: {schema: GeneratePaperTemplateOutputSchema},
  prompt: `You are an expert in generating research paper templates.

  Based on the selected format and the provided research paper content, generate a template for the paper.

  Format: {{{format}}}
  Paper Content: {{{paperContent}}}

  Template:
  `,
});

const generatePaperTemplateFlow = ai.defineFlow(
  {
    name: 'generatePaperTemplateFlow',
    inputSchema: GeneratePaperTemplateInputSchema,
    outputSchema: GeneratePaperTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

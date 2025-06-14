'use server';
/**
 * @fileOverview Summarizes a research paper.
 *
 * - summarizeResearchPaper - A function that summarizes a research paper.
 * - SummarizeResearchPaperInput - The input type for the summarizeResearchPaper function.
 * - SummarizeResearchPaperOutput - The return type for the summarizeResearchPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeResearchPaperInputSchema = z.object({
  pdfText: z.string().describe('The extracted text content from the research paper PDF.'),
});
export type SummarizeResearchPaperInput = z.infer<typeof SummarizeResearchPaperInputSchema>;

const SummarizeResearchPaperOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the research paper.'),
});
export type SummarizeResearchPaperOutput = z.infer<typeof SummarizeResearchPaperOutputSchema>;

export async function summarizeResearchPaper(input: SummarizeResearchPaperInput): Promise<SummarizeResearchPaperOutput> {
  return summarizeResearchPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResearchPaperPrompt',
  input: {schema: SummarizeResearchPaperInputSchema},
  output: {schema: SummarizeResearchPaperOutputSchema},
  prompt: `Summarize the following research paper. Focus on the key findings and main points.\n\n{{{pdfText}}}`,
});

const summarizeResearchPaperFlow = ai.defineFlow(
  {
    name: 'summarizeResearchPaperFlow',
    inputSchema: SummarizeResearchPaperInputSchema,
    outputSchema: SummarizeResearchPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

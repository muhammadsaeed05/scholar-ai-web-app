// src/ai/flows/contextual-chatbot.ts
'use server';

/**
 * @fileOverview A contextual chatbot AI agent for answering questions about research papers.
 *
 * - contextualChatbot - A function that handles the chatbot interaction.
 * - ContextualChatbotInput - The input type for the contextualChatbot function.
 * - ContextualChatbotOutput - The return type for the contextualChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualChatbotInputSchema = z.object({
  paperText: z.string().describe('The extracted text content of the research paper.'),
  question: z.string().describe('The user question about the research paper.'),
});
export type ContextualChatbotInput = z.infer<typeof ContextualChatbotInputSchema>;

const ContextualChatbotOutputSchema = z.object({
  answer: z.string().describe('The contextual answer to the user question.'),
});
export type ContextualChatbotOutput = z.infer<typeof ContextualChatbotOutputSchema>;

export async function contextualChatbot(input: ContextualChatbotInput): Promise<ContextualChatbotOutput> {
  return contextualChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualChatbotPrompt',
  input: {schema: ContextualChatbotInputSchema},
  output: {schema: ContextualChatbotOutputSchema},
  prompt: `You are a chatbot that answers questions about a research paper.

  Here is the content of the research paper:
  {{paperText}}

  Now, answer the following question based on the content of the paper:
  {{question}}
  `,
});

const contextualChatbotFlow = ai.defineFlow(
  {
    name: 'contextualChatbotFlow',
    inputSchema: ContextualChatbotInputSchema,
    outputSchema: ContextualChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

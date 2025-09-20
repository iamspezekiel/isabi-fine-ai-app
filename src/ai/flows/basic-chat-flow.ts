
'use server';
/**
 * @fileOverview A Genkit flow for general health-related questions and answers.
 *
 * - aiGeneralQA - Handles general health Q&A.
 * - GeneralQAInput - Input type for aiGeneralQA.
 * - GeneralQAOutput - Output type for aiGeneralQA.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneralQAInputSchema = z.object({
  query: z.string().describe('The user query for general health information.'),
});
export type GeneralQAInput = z.infer<typeof GeneralQAInputSchema>;

const GeneralQAOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the general health query.'),
});
export type GeneralQAOutput = z.infer<typeof GeneralQAOutputSchema>;

export async function aiGeneralQA(input: GeneralQAInput): Promise<GeneralQAOutput> {
  return generalQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalQAPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: GeneralQAInputSchema },
  output: { schema: GeneralQAOutputSchema },
  prompt: `You are a knowledgeable and empathetic AI Doctor and Health Consultant for IsabiFine AI.
The user is asking a general health question: "{{query}}"

Your task is to:
1. Briefly and politely acknowledge the user's question.
2. Provide a concise, informative, and helpful answer based on general medical knowledge if possible.
3. If the question pertains to a specific medical diagnosis, treatment, or requires in-depth medical expertise beyond general information, gently state that while you can provide information, you are an AI and cannot offer a diagnosis or prescribe treatment. Always recommend consulting a human healthcare professional for personal medical advice and a definitive diagnosis.
4. Mention that more advanced AI features for in-depth health discussions are under development.
5. Keep your entire response concise (3-5 sentences), professional, friendly, and helpful.
`,
});

const generalQAFlow = ai.defineFlow(
  {
    name: 'generalQAFlow',
    inputSchema: GeneralQAInputSchema,
    outputSchema: GeneralQAOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

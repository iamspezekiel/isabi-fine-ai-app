
'use server';
/**
 * @fileOverview A Genkit flow for preliminary symptom checking.
 *
 * - aiSymptomCheck - Handles preliminary symptom checking.
 * - SymptomCheckerInput - Input type for aiSymptomCheck.
 * - SymptomCheckerOutput - Output type for aiSymptomCheck.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomCheckerInputSchema = z.object({
  query: z.string().describe('The user description of their symptoms.'),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

const SymptomCheckerOutputSchema = z.object({
  response: z.string().describe('The AI assistant response regarding the symptoms.'),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function aiSymptomCheck(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: SymptomCheckerInputSchema },
  output: { schema: SymptomCheckerOutputSchema },
  prompt: `You are a knowledgeable and empathetic AI Doctor and Health Consultant for IsabiFine AI, designed to provide preliminary information based on symptoms.
The user describes their symptoms as: "{{query}}"

Your task is to:
1. Acknowledge the described symptoms with empathy.
2. IMPORTANT: Clearly state that while you are an AI Doctor and Health Consultant providing information, you CANNOT provide a medical diagnosis or treatment plan. Emphasize that this information is for general understanding only and is not a substitute for a consultation with a human healthcare professional.
3. Strongly suggest that the user consult with a qualified healthcare professional for an accurate diagnosis, medical advice, and appropriate treatment.
4. Briefly mention that the full AI-powered symptom checker with more detailed insights is still under development and aims to provide helpful preliminary information in the future.
5. Keep your response concise (3-5 sentences), empathetic, professional, and responsible.
`,
});

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

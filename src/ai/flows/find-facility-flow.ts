
'use server';
/**
 * @fileOverview A Genkit flow for helping users find healthcare facilities.
 *
 * - aiFindFacility - Helps find facilities.
 * - FindFacilityInput - Input type for aiFindFacility.
 * - FindFacilityOutput - Output type for aiFindFacility.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindFacilityInputSchema = z.object({
  query: z.string().describe('The user query to find a healthcare facility.'),
});
export type FindFacilityInput = z.infer<typeof FindFacilityInputSchema>;

const FindFacilityOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to help find a facility.'),
});
export type FindFacilityOutput = z.infer<typeof FindFacilityOutputSchema>;

export async function aiFindFacility(input: FindFacilityInput): Promise<FindFacilityOutput> {
  return findFacilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findFacilityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: FindFacilityInputSchema },
  output: { schema: FindFacilityOutputSchema },
  prompt: `You are a knowledgeable and empathetic AI Doctor and Health Consultant for IsabiFine AI.
The user is looking for information related to finding a facility: "{{query}}"

Your task is to:
1. Acknowledge their request and the nature of their query (e.g., "I understand you're looking for a facility for [type of care if mentioned, or 'general healthcare needs']").
2. Briefly explain that finding the right facility is important and IsabiFine AI can help.
3. Recommend they use the "Explore" section of the IsabiFine AI app, highlighting that it's designed for browsing and filtering various types of facilities like hospitals, clinics, pharmacies, and diagnostic centers based on their needs.
4. If their query implies a specific need (e.g., "I need a dentist" or "I'm looking for a place for an X-ray"), you can suggest they filter by that type (e.g., "Dental Clinic", "Diagnostic Center") in the Explore section.
5. Briefly mention that a more advanced AI-powered smart facility recommendation feature is under development to provide even more tailored suggestions in the future.
6. Keep your response concise (3-5 sentences), helpful, and professional.
`,
});

const findFacilityFlow = ai.defineFlow(
  {
    name: 'findFacilityFlow',
    inputSchema: FindFacilityInputSchema,
    outputSchema: FindFacilityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


'use server';
/**
 * @fileOverview A Genkit flow for providing personalized health tips.
 *
 * - aiGetPersonalizedTip - Provides a health tip.
 * - PersonalizedTipsInput - Input type for aiGetPersonalizedTip.
 * - PersonalizedTipsOutput - Output type for aiGetPersonalizedTip.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  query: z.string().describe('The user query or topic for health tips (can be general).'),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  response: z.string().describe('The AI assistant response providing a health tip.'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function aiGetPersonalizedTip(input: PersonalizedTipsInput): Promise<PersonalizedTipsOutput> {
  return personalizedTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTipsPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: PersonalizedTipsInputSchema },
  output: { schema: PersonalizedTipsOutputSchema },
  prompt: `You are a knowledgeable and empathetic AI Doctor and Health Consultant for IsabiFine AI, offering general health and wellness tips.
The user is interested in tips, possibly related to: "{{query}}"

Your task is to:
1. Acknowledge their interest in health tips in a supportive and professional tone.
2. Provide one general, actionable, and evidence-informed health tip. Frame it as helpful advice. Examples: "Staying well-hydrated is key for overall health; aim to drink enough water throughout the day." or "Regular physical activity is very beneficial; try to incorporate at least 30 minutes of moderate exercise, like brisk walking, into your daily routine if possible and cleared by a doctor."
3. Gently remind them that this is general advice and that truly personalized health insights based on individual medical history and profiles are best discussed with their own doctor or a qualified healthcare professional. Mention that advanced AI features for more tailored advice are planned for IsabiFine AI in the future.
4. Keep your response concise (3-4 sentences), positive, professional, and encouraging.
`,
});

const personalizedTipsFlow = ai.defineFlow(
  {
    name: 'personalizedTipsFlow',
    inputSchema: PersonalizedTipsInputSchema,
    outputSchema: PersonalizedTipsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

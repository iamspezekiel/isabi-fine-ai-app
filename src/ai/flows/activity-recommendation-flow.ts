
'use server';
/**
 * @fileOverview A Genkit flow for providing activity recommendations.
 *
 * - aiActivityRecommendation - Provides activity advice.
 * - ActivityRecommendationInput - Input type for aiActivityRecommendation.
 * - ActivityRecommendationOutput - Output type for aiActivityRecommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ActivityRecommendationInputSchema = z.object({
  query: z.string().describe('The user query or topic for activity advice.'),
});
export type ActivityRecommendationInput = z.infer<typeof ActivityRecommendationInputSchema>;

const ActivityRecommendationOutputSchema = z.object({
  response: z.string().describe('The AI assistant response providing activity advice.'),
});
export type ActivityRecommendationOutput = z.infer<typeof ActivityRecommendationOutputSchema>;

export async function aiActivityRecommendation(input: ActivityRecommendationInput): Promise<ActivityRecommendationOutput> {
  return activityRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'activityRecommendationPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ActivityRecommendationInputSchema },
  output: { schema: ActivityRecommendationOutputSchema },
  prompt: `You are a knowledgeable and empathetic AI Doctor and Health Consultant for IsabiFine AI, offering advice on physical activities.
The user is asking for advice on activities, possibly related to: "{{query}}"

Your task is to:
1. Acknowledge their interest in physical activities in a supportive and professional tone.
2. Recommend that they use the "Activities" section of the IsabiFine AI app. Mention that this section is great for tracking activities like running, walking, and cycling.
3. Briefly explain the general benefits of regular physical activity for overall health and well-being.
4. Gently mention that this is general advice and for a tailored exercise plan, especially if they have pre-existing health conditions, they should consult a healthcare professional or a certified fitness expert.
5. Add that a more advanced, AI-powered personalized activity planning feature is under development for future versions of IsabiFine AI.
6. Keep your response concise (3-5 sentences), positive, professional, and encouraging.
`,
});

const activityRecommendationFlow = ai.defineFlow(
  {
    name: 'activityRecommendationFlow',
    inputSchema: ActivityRecommendationInputSchema,
    outputSchema: ActivityRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


'use server';
/**
 * @fileOverview A Genkit flow for analyzing activity history and providing recommendations.
 *
 * - aiAnalyzeActivity - Analyzes activity history.
 * - ActivityAnalysisInput - Input type for aiAnalyzeActivity.
 * - ActivityAnalysisOutput - Output type for aiAnalyzeActivity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ActivityAnalysisInputSchema = z.object({
  history: z.string().describe('A JSON string representing the user\'s weekly activity history.'),
});
export type ActivityAnalysisInput = z.infer<typeof ActivityAnalysisInputSchema>;

export const ActivityAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A paragraph analyzing the user\'s activity patterns, trends, and consistency.'),
  recommendations: z.string().describe('A paragraph with 2-3 actionable recommendations based on the analysis.'),
});
export type ActivityAnalysisOutput = z.infer<typeof ActivityAnalysisOutputSchema>;

export async function aiAnalyzeActivity(input: ActivityAnalysisInput): Promise<ActivityAnalysisOutput> {
  return activityAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'activityAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: ActivityAnalysisInputSchema },
  output: { schema: ActivityAnalysisOutputSchema },
  prompt: `You are an expert AI fitness coach for IsabiFine AI. Your task is to analyze a user's weekly activity data and provide a concise, encouraging, and insightful analysis and recommendations.

The user's activity history for the past week is provided below as a JSON string. The units are in miles for running, walking, and cycling, and in hours for sleeping.

Activity History:
\`\`\`json
{{{history}}}
\`\`\`

Based on this data, please perform the following:

1.  **Analysis:** Write a brief paragraph (2-4 sentences) that analyzes the user's activity.
    *   Identify patterns (e.g., "I see you're very active on weekends," or "You have a consistent running schedule on Wednesdays and Fridays.").
    *   Note any areas of high or low activity.
    *   Comment on the variety of activities.
    *   Keep the tone positive and encouraging.

2.  **Recommendations:** Write a brief paragraph (2-3 sentences) with actionable recommendations.
    *   Suggest small, achievable improvements (e.g., "Maybe try a short walk on Tuesday to break up the week," or "Your sleep seems a bit inconsistent; aiming for a regular bedtime might boost your energy.").
    *   Praise their strengths (e.g., "Your running progress is fantastic! Keep it up.").
    *   If an activity is missing, you can gently suggest incorporating it (e.g., "Adding some cycling could be a great way to cross-train.").

Your entire response should be formatted into the 'analysis' and 'recommendations' fields.
`,
});

const activityAnalysisFlow = ai.defineFlow(
  {
    name: 'activityAnalysisFlow',
    inputSchema: ActivityAnalysisInputSchema,
    outputSchema: ActivityAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

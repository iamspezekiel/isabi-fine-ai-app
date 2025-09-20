
'use server';
/**
 * @fileOverview A Genkit flow for parsing and logging user activities.
 *
 * - logActivity - Parses user text to identify and log an activity.
 * - LogActivityInput - Input type for logActivity.
 * - LogActivityOutput - Output type for logActivity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const LogActivityInputSchema = z.object({
  text: z.string().describe('The natural language text from the user describing their activity.'),
});
export type LogActivityInput = z.infer<typeof LogActivityInputSchema>;

export const LogActivityOutputSchema = z.object({
  activityType: z
    .enum(['running', 'walking', 'cycling', 'sleeping', 'none'])
    .describe('The type of activity identified. Use "none" if no specific activity is recognized.'),
  value: z.number().describe('The numeric value of the activity (e.g., miles, hours). Set to 0 if not identified.'),
  unit: z.string().describe('The unit of the activity (e.g., "miles", "km", "hours").'),
  responseText: z.string().optional().describe('A text response to the user if the activity could not be logged.'),
});
export type LogActivityOutput = z.infer<typeof LogActivityOutputSchema>;

export async function logActivity(input: LogActivityInput): Promise<LogActivityOutput> {
  return logActivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'logActivityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: LogActivityInputSchema },
  output: { schema: LogActivityOutputSchema },
  prompt: `You are an intelligent activity logging assistant for a health app called IsabiFine AI.
Your task is to analyze the user's text and extract the activity type and its value.

The supported activity types are: "running", "walking", "cycling", "sleeping".
The units for running, walking, and cycling can be "miles" or "km". The unit for sleeping is "hours".

User input: "{{text}}"

Analyze the input and determine the activity type, the numerical value, and the unit.
- If you identify one of the supported activities and a numerical value, populate the 'activityType', 'value', and 'unit' fields.
- If the user's input is a question, a general statement, or an activity you don't recognize, set 'activityType' to "none", 'value' to 0, and provide a helpful 'responseText' like "I can help you log running, walking, cycling, or sleeping. For example, say 'I just walked 3km'."
- Be flexible. "Jogged" means running. "Biked" means cycling.
- Always provide a valid numerical value for 'value', defaulting to 0 if none is found.
`,
});

const logActivityFlow = ai.defineFlow(
  {
    name: 'logActivityFlow',
    inputSchema: LogActivityInputSchema,
    outputSchema: LogActivityOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

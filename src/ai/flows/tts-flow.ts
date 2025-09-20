
'use server';
/**
 * @fileOverview A Genkit flow for converting text to speech.
 *
 * - aiTextToSpeech - Converts text to audio.
 * - TextToSpeechInput - Input type for aiTextToSpeech.
 * - TextToSpeechOutput - Output type for aiTextToSpeech.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

export const TextToSpeechInputSchema = z.object({
  textToSpeak: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in WAV format. Format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function aiTextToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return ttsFlow(input);
}

// Helper function to convert PCM audio buffer to a Base64 encoded WAV string
async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        const bufs: any[] = [];
        writer.on('error', reject);
        writer.on('data', (d) => bufs.push(d));
        writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

        writer.write(pcmData);
        writer.end();
    });
}


const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ textToSpeak }) => {
    // Return early if there's nothing to speak
    if (!textToSpeak.trim()) {
        return { audioDataUri: '' };
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A pleasant, clear voice
          },
        },
      },
      prompt: textToSpeak,
    });
    
    if (!media || !media.url) {
      throw new Error('No audio media was returned from the TTS model.');
    }
    
    // The media.url from Gemini TTS is a data URI with raw PCM data
    // Format: 'data:audio/L16;rate=24000;channels=1;base64,<base64_pcm_data>'
    // We need to extract the base64 data and convert it to a WAV file format.
    const pcmBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(pcmBase64, 'base64');

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

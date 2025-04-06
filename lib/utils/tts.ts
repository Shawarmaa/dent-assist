import { createClient, toWav } from '@neuphonic/neuphonic-js';

// This file should only be imported by server components or API routes
// Do not import this directly in client components

const NEUPHONIC_API_KEY = process.env.NEXT_PUBLIC_NEUPHONIC_API_KEY || '';

// Create the client for server-side use only
const client = createClient({ apiKey: NEUPHONIC_API_KEY });

/**
 * Get all available voices, optionally filtered by locale
 * @param locale - Optional language code to filter voices (e.g., 'en', 'es', 'de')
 * @returns Promise with the list of available voices
 */

export async function getVoices(locale?: string) {

  try {
    const voices = await client.voices.list();
    
    // If locale is provided, filter voices by the specified language code
    if (locale) {
      return voices.filter(voice => voice.lang_code === locale);
    }
    
    return voices;

  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

/**
 * Perform text-to-speech conversion
 * @param text - The text to convert to speech
 * @param options - Configuration options for the TTS
 * @returns Promise with the audio data as Uint8Array
 */

export async function textToSpeech(
  text: string,
  options: {
    locale?: string;
    voiceId?: string;
    speed?: number;
  } = {}
) {

  try {
    
    const {
      locale = 'en',
      voiceId,
      speed = 1.0
    } = options;

    // Configure the SSE connection for text-to-speech
    const sse = await client.tts.sse({
      lang_code: locale,
      voice_id: voiceId,
      speed: speed
    });

    // Add <STOP> marker to indicate the end of the text
    const formattedText = text.endsWith('<STOP>') ? text : `${text}<STOP>`;
    
    // Send the text and get the audio response
    const response = await sse.send(formattedText);
    
    // Convert the audio data to WAV format
    const wavData = toWav(response.audio);
    
    return wavData;
    
  } catch (error) {
    
    console.error('Error performing text-to-speech:', error);
    throw error;
  }
}
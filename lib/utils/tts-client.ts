/**
 * Client-side utility functions for text-to-speech
 * This file is safe to import in client components
 */

/**
 * Get all available voices, optionally filtered by locale
 * @param locale - Optional language code to filter voices (e.g., 'en', 'es', 'de')
 * @returns Promise with the list of available voices
 */

export async function getVoices(locale?: string) {

  try {

    const response = await fetch(`/api/tts/voices${locale ? `?locale=${locale}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    return await response.json();

  } catch (error) {

    console.error('Error fetching voices:', error);
    throw error;
  }
}

/**
 * Perform text-to-speech conversion
 * @param text - The text to convert to speech
 * @param options - Configuration options for the TTS
 * @returns Promise with the audio blob
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

    const response = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ...options
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to synthesize speech');
    }
    
    return await response.blob();

  } catch (error) {
    
    console.error('Error performing text-to-speech:', error);
    throw error;
  }
}

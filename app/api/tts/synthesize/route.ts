import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/utils/tts';

export async function POST(request: NextRequest) {

  try {
    
    // Parse the request body
    const body = await request.json();
    const { text, locale, voiceId, speed } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Generate speech using the Neuphonic API
    const audioData = await textToSpeech(text, {
      locale,
      voiceId,
      speed
    });
    
    // Return the audio data as a binary response
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="speech.wav"'
      }
    });
    
  } catch (error) {

    console.error('Error synthesizing speech:', error);
    
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}

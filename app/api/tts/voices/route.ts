import { NextRequest, NextResponse } from 'next/server';
import { getVoices } from '@/lib/utils/tts';

export async function GET(request: NextRequest) {

  try {

    // Get locale from query params
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || undefined;
    
    // Fetch voices from the Neuphonic API
    const voices = await getVoices(locale);
    
    // Return the voices as JSON
    return NextResponse.json(voices);

  } catch (error) {
    
    console.error('Error fetching voices:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
